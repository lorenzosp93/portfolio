from concurrent.futures import ThreadPoolExecutor
from datetime import timedelta
from threading import Barrier
from unittest.mock import patch

from django.core import mail
from django.db import OperationalError, close_old_connections
from django.test import Client, TestCase, TransactionTestCase, override_settings
from django.urls import reverse

from django.utils import timezone

from .email import process_next_submission
from .models import ContactAdmissionLock, ContactSubmission


@override_settings(CONTACT_SOURCE_HOURLY_LIMIT=2)
class ContactAdmissionTests(TestCase):
    def post(self, content='Hello', **headers):
        return self.client.post(reverse('contacts:contacts'), {
            'first_name': 'Ada', 'last_name': 'Lovelace',
            'email': 'ada@example.test', 'content': content,
        }, **headers)

    def test_repeated_payload_does_not_enqueue_another_email(self):
        self.assertEqual(self.post().status_code, 202)
        self.assertEqual(self.post().status_code, 429)
        self.assertEqual(ContactSubmission.objects.count(), 1)

    def test_varied_payload_and_forged_forwarding_headers_cannot_bypass_source_limit(self):
        for index in range(2):
            self.assertEqual(self.post(str(index)).status_code, 202)
        response = self.post('different', HTTP_X_FORWARDED_FOR='203.0.113.99')
        self.assertEqual(response.status_code, 429)
        self.assertFalse(response.json()['success'])
        self.assertIn('message', response.json())
        self.assertEqual(ContactSubmission.objects.count(), 2)

    @override_settings(CONTACT_GLOBAL_HOURLY_LIMIT=2)
    def test_rotating_sources_cannot_bypass_global_hourly_budget(self):
        for index in range(2):
            self.assertEqual(self.post(str(index), REMOTE_ADDR=f'192.0.2.{index}').status_code, 202)
        self.assertEqual(self.post('third', REMOTE_ADDR='198.51.100.1').status_code, 429)
        self.assertEqual(ContactSubmission.objects.count(), 2)

    @override_settings(CONTACT_GLOBAL_DAILY_LIMIT=2)
    def test_sent_and_failed_rows_still_consume_daily_budget(self):
        for index, delivery_status in enumerate(('sent', 'failed')):
            self.assertEqual(self.post(str(index)).status_code, 202)
            ContactSubmission.objects.filter(content=str(index)).update(
                submitted_at=timezone.now() - timedelta(hours=2),
                delivery_status=delivery_status,
            )
        self.assertEqual(self.post('third', REMOTE_ADDR='198.51.100.1').status_code, 429)
        self.assertEqual(ContactSubmission.objects.count(), 2)

    @override_settings(CONTACT_MAX_PENDING=1)
    def test_old_processing_backlog_blocks_admission(self):
        self.assertEqual(self.post().status_code, 202)
        ContactSubmission.objects.update(
            submitted_at=timezone.now() - timedelta(days=2),
            delivery_status='processing',
        )
        self.assertEqual(self.post('next').status_code, 429)
        self.assertEqual(ContactSubmission.objects.count(), 1)

    def test_ipv6_privacy_addresses_share_source_budget(self):
        for index in range(2):
            self.assertEqual(self.post(str(index), REMOTE_ADDR=f'2001:db8::a{index}').status_code, 202)
        self.assertEqual(self.post('third', REMOTE_ADDR='2001:db8::ffff').status_code, 429)

    def test_mapped_ipv4_cannot_get_a_second_source_budget(self):
        for index in range(2):
            self.assertEqual(self.post(str(index), REMOTE_ADDR='192.0.2.1').status_code, 202)
        self.assertEqual(self.post('third', REMOTE_ADDR='::ffff:192.0.2.1').status_code, 429)

    def test_duplicate_is_suppressed_across_sources_and_after_delivery(self):
        self.assertEqual(self.post().status_code, 202)
        ContactSubmission.objects.update(delivery_status='sent')
        self.assertEqual(self.post(REMOTE_ADDR='198.51.100.1').status_code, 429)
        self.assertEqual(ContactSubmission.objects.count(), 1)

    def test_budgets_expire_and_legitimate_mail_can_be_delivered(self):
        with self.settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend'):
            self.assertEqual(self.post().status_code, 202)
            self.assertTrue(process_next_submission())
            ContactSubmission.objects.update(submitted_at=timezone.now() - timedelta(days=2))
            self.assertEqual(self.post().status_code, 202)
            self.assertTrue(process_next_submission())
            self.assertEqual(len(mail.outbox), 2)

    def test_database_contention_fails_closed(self):
        with patch('contacts.admission.ContactAdmissionLock.objects.get_or_create',
                   side_effect=OperationalError('database is locked')):
            response = self.post()
        self.assertEqual(response.status_code, 503)
        self.assertFalse(ContactSubmission.objects.exists())



@override_settings(CONTACT_GLOBAL_HOURLY_LIMIT=1)
class ContactAdmissionConcurrencyTests(TransactionTestCase):
    def test_concurrent_clients_cannot_overbook_final_slot(self):
        ContactAdmissionLock.objects.create(pk=1)
        barrier = Barrier(4)

        def submit(index):
            close_old_connections()
            try:
                barrier.wait(timeout=10)
                return Client().post(reverse('contacts:contacts'), {
                    'first_name': 'Ada', 'last_name': 'Lovelace',
                    'email': 'ada@example.test', 'content': str(index),
                }, REMOTE_ADDR=f'192.0.2.{index}').status_code
            finally:
                close_old_connections()

        with ThreadPoolExecutor(max_workers=4) as executor:
            statuses = list(executor.map(submit, range(4)))
        self.assertEqual(statuses.count(202), 1)
        self.assertTrue(all(code in (202, 429, 503) for code in statuses), statuses)
        self.assertEqual(ContactSubmission.objects.count(), 1)
