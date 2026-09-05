import logging
from datetime import timedelta

from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from django.core.mail import EmailMultiAlternatives, get_connection
from django.db import transaction
from django.db.models import Q
from django.template.loader import render_to_string
from django.utils import timezone

from .models import ContactSubmission

logger = logging.getLogger(__name__)


def send_contact_notification(submission):
    if settings.EMAIL_BACKEND == 'django.core.mail.backends.smtp.EmailBackend':
        required = {
            'EMAIL_HOST': settings.EMAIL_HOST,
            'EMAIL_HOST_USER': settings.EMAIL_HOST_USER,
            'EMAIL_HOST_PASSWORD': settings.EMAIL_HOST_PASSWORD,
        }
        missing = [name for name, value in required.items() if not value]
        if missing:
            raise ImproperlyConfigured(
                'Missing SMTP configuration: ' + ', '.join(missing)
            )

    subject = (
        f'Portfolio message from {submission.first_name} '
        f'{submission.last_name}'
    )
    context = {'submission': submission}
    plain_text = render_to_string(
        'contacts/contact_notification.txt', context
    ).strip()
    html = render_to_string(
        'contacts/contact_notification.html', context
    ).strip()

    with get_connection() as connection:
        message = EmailMultiAlternatives(
            subject=subject,
            body=plain_text,
            from_email=settings.EMAIL_FROM,
            to=[settings.EMAIL_TO],
            reply_to=[submission.email],
            connection=connection,
        )
        message.attach_alternative(html, 'text/html')
        if message.send() != 1:
            raise RuntimeError('Email backend did not accept the message')


def claim_next_submission(now=None):
    now = now or timezone.now()
    lease_expired_at = now - timedelta(
        seconds=settings.CONTACT_EMAIL_LEASE_SECONDS
    )
    eligible = (
        Q(
            delivery_status=ContactSubmission.DeliveryStatus.PENDING,
            next_delivery_attempt_at__lte=now,
        )
        | Q(
            delivery_status=ContactSubmission.DeliveryStatus.PROCESSING,
            delivery_started_at__lte=lease_expired_at,
        )
    )

    with transaction.atomic():
        submission = (
            ContactSubmission.objects.select_for_update(skip_locked=True)
            .filter(eligible)
            .order_by('next_delivery_attempt_at', 'submitted_at')
            .first()
        )
        if submission is None:
            return None

        submission.delivery_status = ContactSubmission.DeliveryStatus.PROCESSING
        submission.delivery_started_at = now
        submission.delivery_attempts += 1
        submission.save(update_fields=(
            'delivery_status', 'delivery_started_at', 'delivery_attempts',
        ))
        return submission


def process_next_submission(now=None):
    submission = claim_next_submission(now=now)
    if submission is None:
        return False

    try:
        send_contact_notification(submission)
    except Exception as exc:
        _record_failure(submission, exc, now=timezone.now())
        logger.exception(
            'Contact email delivery failed; submission_id=%s attempt=%s',
            submission.pk,
            submission.delivery_attempts,
        )
    else:
        ContactSubmission.objects.filter(pk=submission.pk).update(
            delivery_status=ContactSubmission.DeliveryStatus.SENT,
            delivered_at=timezone.now(),
            delivery_error='',
            delivery_started_at=None,
            next_delivery_attempt_at=None,
        )
    return True


def _record_failure(submission, exc, now):
    terminal = submission.delivery_attempts >= settings.CONTACT_EMAIL_MAX_ATTEMPTS
    retry_delay = settings.CONTACT_EMAIL_RETRY_BASE_SECONDS * (
        2 ** (submission.delivery_attempts - 1)
    )
    ContactSubmission.objects.filter(pk=submission.pk).update(
        delivery_status=(
            ContactSubmission.DeliveryStatus.FAILED
            if terminal
            else ContactSubmission.DeliveryStatus.PENDING
        ),
        next_delivery_attempt_at=(
            None
            if terminal
            else now + timedelta(seconds=retry_delay)
        ),
        delivery_started_at=None,
        delivery_error=str(exc)[:2000],
    )
