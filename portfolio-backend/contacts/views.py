import logging

from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from django.core.mail import EmailMultiAlternatives, get_connection
from django.middleware.csrf import get_token
from django.template.loader import render_to_string
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import ContactSerializer
from .models import ContactSubmission

logger = logging.getLogger(__name__)


@api_view(('GET',))
@permission_classes((AllowAny,))
def get_csrf_token(request):
    token = get_token(request)
    return Response({"token": token}, status=status.HTTP_200_OK)


class ContactView(APIView):
    """
    View to post a contact form and submit an email upon valid content.
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer_class = ContactSerializer(data=request.data)
        if not serializer_class.is_valid():
            return Response(
                {
                    "success": False,
                    "message": "Invalid contact form submission.",
                    "errors": serializer_class.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        data = serializer_class.validated_data
        submission = ContactSubmission.objects.create(**data)
        try:
            self.send_mail(submission)
        except Exception as exc:
            submission.delivery_status = ContactSubmission.DeliveryStatus.FAILED
            submission.delivery_error = str(exc)[:2000]
            submission.save(update_fields=('delivery_status', 'delivery_error'))
            logger.exception(
                "Failed to send contact form email; submission_id=%s",
                submission.pk,
            )
            return Response(
                {
                    "success": True,
                    "message": "Message received and saved, but the email notification could not be sent.",
                },
                status=status.HTTP_202_ACCEPTED,
            )

        submission.delivery_status = ContactSubmission.DeliveryStatus.SENT
        submission.delivered_at = timezone.now()
        submission.delivery_error = ''
        submission.save(update_fields=(
            'delivery_status', 'delivered_at', 'delivery_error',
        ))

        return Response(
            {
                "success": True,
                "message": "Message sent successfully.",
            },
            status=status.HTTP_200_OK,
        )

    @staticmethod
    def send_mail(submission):
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
