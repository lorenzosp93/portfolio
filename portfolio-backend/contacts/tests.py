from concurrent.futures import ThreadPoolExecutor
from datetime import timedelta
from io import StringIO
from unittest import skipUnless
from unittest.mock import patch

from django.contrib import admin
from django.core import mail
from django.core.management import call_command
from django.db import close_old_connections, connection
from django.test import TestCase, TransactionTestCase, override_settings
from django.urls import reverse
from django.utils import timezone

from .email import claim_next_submission, process_next_submission
from .models import ContactSubmission


@override_settings(
    EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend',
    EMAIL_TO='portfolio@example.test',
    EMAIL_FROM='notifications@example.test',
)
class ContactViewTests(TestCase):
    def test_valid_submission_is_queued_without_sending_in_request(self):
        response = self.client.post(
            reverse('contacts:contacts'),
            {
                'first_name': 'Ada',
                'last_name': 'Lovelace',
                'email': 'ada@example.test',
                'content': 'Hello from a test.',
            },
        )

        self.assertEqual(response.status_code, 202)
        self.assertTrue(response.json()['success'])
        self.assertEqual(response.json()['message'], 'Message received successfully.')
        self.assertEqual(len(mail.outbox), 0)
        submission = ContactSubmission.objects.get()
        self.assertEqual(submission.delivery_status, 'pending')
        self.assertEqual(submission.delivery_attempts, 0)

    def test_invalid_submission_returns_validation_errors(self):
        response = self.client.post(reverse('contacts:contacts'), {})

        self.assertEqual(response.status_code, 400)
        self.assertFalse(response.json()['success'])
        self.assertIn('errors', response.json())
        self.assertFalse(ContactSubmission.objects.exists())


@override_settings(
    EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend',
    EMAIL_TO='portfolio@example.test',
    EMAIL_FROM='notifications@example.test',
    CONTACT_EMAIL_MAX_ATTEMPTS=3,
    CONTACT_EMAIL_RETRY_BASE_SECONDS=60,
    CONTACT_EMAIL_LEASE_SECONDS=300,
)
class ContactDeliveryTests(TestCase):
    def create_submission(self, **overrides):
        values = {
            'first_name': 'Ada',
            'last_name': 'Lovelace',
            'email': 'ada@example.test',
            'content': 'Hello from a test.\n\n<script>alert("nope")</script>',
        }
        values.update(overrides)
        return ContactSubmission.objects.create(**values)

    def test_worker_sends_queued_email_and_records_delivery(self):
        submission = self.create_submission()

        self.assertTrue(process_next_submission())

        self.assertEqual(len(mail.outbox), 1)
        message = mail.outbox[0]
        self.assertEqual(message.to, ['portfolio@example.test'])
        self.assertEqual(message.from_email, 'notifications@example.test')
        self.assertEqual(message.reply_to, ['ada@example.test'])
        self.assertEqual(message.subject, 'Portfolio message from Ada Lovelace')
        self.assertIn('Ada Lovelace', message.body)
        self.assertIn('<script>alert("nope")</script>', message.body)
        self.assertEqual(len(message.alternatives), 1)
        html = message.alternatives[0].content
        self.assertEqual(message.alternatives[0].mimetype, 'text/html')
        self.assertIn('mailto:ada@example.test', html)
        self.assertNotIn('<script>', html)
        self.assertIn('&lt;script&gt;', html)
        submission.refresh_from_db()
        self.assertEqual(submission.delivery_status, 'sent')
        self.assertEqual(submission.delivery_attempts, 1)
        self.assertIsNotNone(submission.delivered_at)
        self.assertIsNone(submission.next_delivery_attempt_at)

    def test_worker_does_not_claim_future_retry(self):
        submission = self.create_submission(
            next_delivery_attempt_at=timezone.now() + timedelta(minutes=5)
        )

        self.assertIsNone(claim_next_submission())

        submission.refresh_from_db()
        self.assertEqual(submission.delivery_status, 'pending')
        self.assertEqual(submission.delivery_attempts, 0)

    def test_worker_reclaims_an_expired_processing_lease(self):
        submission = self.create_submission(
            delivery_status=ContactSubmission.DeliveryStatus.PROCESSING,
            delivery_started_at=timezone.now() - timedelta(minutes=6),
            delivery_attempts=1,
        )

        claimed = claim_next_submission()

        self.assertEqual(claimed.pk, submission.pk)
        self.assertEqual(claimed.delivery_attempts, 2)

    def test_worker_does_not_claim_an_active_processing_lease(self):
        submission = self.create_submission(
            delivery_status=ContactSubmission.DeliveryStatus.PROCESSING,
            delivery_started_at=timezone.now(),
            delivery_attempts=1,
        )

        self.assertIsNone(claim_next_submission())

        submission.refresh_from_db()
        self.assertEqual(submission.delivery_attempts, 1)

    @patch(
        'contacts.email.send_contact_notification',
        side_effect=OSError('SMTP unavailable'),
    )
    def test_failure_is_rescheduled_with_exponential_backoff(self, _send):
        submission = self.create_submission()
        before = timezone.now()

        self.assertTrue(process_next_submission())

        submission.refresh_from_db()
        self.assertEqual(submission.delivery_status, 'pending')
        self.assertEqual(submission.delivery_attempts, 1)
        self.assertEqual(submission.delivery_error, 'SMTP unavailable')
        self.assertGreaterEqual(
            submission.next_delivery_attempt_at,
            before + timedelta(seconds=60),
        )

    @patch(
        'contacts.email.send_contact_notification',
        side_effect=OSError('still down'),
    )
    def test_last_failure_becomes_terminal(self, _send):
        submission = self.create_submission(delivery_attempts=2)

        self.assertTrue(process_next_submission())

        submission.refresh_from_db()
        self.assertEqual(submission.delivery_status, 'failed')
        self.assertEqual(submission.delivery_attempts, 3)
        self.assertIsNone(submission.next_delivery_attempt_at)

    def test_once_command_drains_current_queue(self):
        first = self.create_submission()
        second = self.create_submission(email='grace@example.test')

        call_command('process_contact_submissions', '--once', stdout=StringIO())

        first.refresh_from_db()
        second.refresh_from_db()
        self.assertEqual(first.delivery_status, 'sent')
        self.assertEqual(second.delivery_status, 'sent')
        self.assertEqual(len(mail.outbox), 2)


class ContactAdminTests(TestCase):
    def test_submissions_are_read_only_in_admin(self):
        model_admin = admin.site._registry[ContactSubmission]

        self.assertFalse(model_admin.has_add_permission(None))
        self.assertFalse(model_admin.has_change_permission(None))
        self.assertFalse(model_admin.has_delete_permission(None))

    def test_retry_action_requeues_only_unsent_submissions(self):
        failed = ContactSubmission.objects.create(
            first_name='Grace',
            last_name='Hopper',
            email='grace@example.test',
            content='Retry this.',
            delivery_status=ContactSubmission.DeliveryStatus.FAILED,
            delivery_attempts=5,
            delivery_error='SMTP unavailable',
        )
        sent = ContactSubmission.objects.create(
            first_name='Ada',
            last_name='Lovelace',
            email='ada@example.test',
            content='Already sent.',
            delivery_status=ContactSubmission.DeliveryStatus.SENT,
            delivery_attempts=1,
        )
        model_admin = admin.site._registry[ContactSubmission]

        with patch.object(model_admin, 'message_user'):
            model_admin.retry_delivery(
                None,
                ContactSubmission.objects.filter(pk__in=(failed.pk, sent.pk)),
            )

        failed.refresh_from_db()
        sent.refresh_from_db()
        self.assertEqual(failed.delivery_status, 'pending')
        self.assertEqual(failed.delivery_attempts, 0)
        self.assertEqual(failed.delivery_error, '')
        self.assertEqual(sent.delivery_status, 'sent')


@override_settings(CONTACT_EMAIL_LEASE_SECONDS=300)
class ContactClaimConcurrencyTests(TransactionTestCase):
    @skipUnless(
        connection.vendor == 'postgresql',
        'PostgreSQL is required to exercise skip_locked concurrency.',
    )
    def test_only_one_worker_claims_a_submission(self):
        submission = ContactSubmission.objects.create(
            first_name='Katherine',
            last_name='Johnson',
            email='katherine@example.test',
            content='Concurrent claim test.',
        )

        def claim():
            close_old_connections()
            try:
                claimed = claim_next_submission()
                return claimed.pk if claimed else None
            finally:
                close_old_connections()

        with ThreadPoolExecutor(max_workers=2) as executor:
            claimed_ids = list(executor.map(lambda _index: claim(), range(2)))

        self.assertEqual(claimed_ids.count(submission.pk), 1)
        self.assertEqual(claimed_ids.count(None), 1)
