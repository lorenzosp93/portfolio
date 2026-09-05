from django.core import mail
from django.contrib import admin
from unittest.mock import patch
from django.test import TestCase, override_settings
from django.urls import reverse

from .models import ContactSubmission


@override_settings(
    EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend',
    EMAIL_TO='portfolio@example.test',
    EMAIL_FROM='notifications@example.test',
)
class ContactViewTests(TestCase):
    def test_valid_submission_sends_an_email(self):
        response = self.client.post(
            reverse('contacts:contacts'),
            {
                'first_name': 'Ada',
                'last_name': 'Lovelace',
                'email': 'ada@example.test',
                'content': 'Hello from a test.\n\n<script>alert("nope")</script>',
            },
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['success'], True)
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, ['portfolio@example.test'])
        self.assertEqual(mail.outbox[0].from_email, 'notifications@example.test')
        self.assertEqual(mail.outbox[0].reply_to, ['ada@example.test'])
        self.assertEqual(mail.outbox[0].subject, 'Portfolio message from Ada Lovelace')
        self.assertIn('Ada Lovelace', mail.outbox[0].body)
        self.assertIn('ada@example.test', mail.outbox[0].body)
        self.assertIn('<script>alert("nope")</script>', mail.outbox[0].body)
        self.assertEqual(len(mail.outbox[0].alternatives), 1)
        html = mail.outbox[0].alternatives[0].content
        self.assertEqual(mail.outbox[0].alternatives[0].mimetype, 'text/html')
        self.assertIn('Ada Lovelace', html)
        self.assertIn('mailto:ada@example.test', html)
        self.assertNotIn('<script>', html)
        self.assertIn('&lt;script&gt;', html)
        submission = ContactSubmission.objects.get()
        self.assertEqual(submission.delivery_status, 'sent')
        self.assertIsNotNone(submission.delivered_at)

    def test_invalid_submission_returns_validation_errors(self):
        response = self.client.post(reverse('contacts:contacts'), {})

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()['success'], False)
        self.assertIn('errors', response.json())
        self.assertFalse(ContactSubmission.objects.exists())

    @patch('contacts.views.ContactView.send_mail', side_effect=OSError('SMTP unavailable'))
    def test_mail_failure_keeps_submission_for_admin(self, _send_mail):
        response = self.client.post(
            reverse('contacts:contacts'),
            {
                'first_name': 'Grace',
                'last_name': 'Hopper',
                'email': 'grace@example.test',
                'content': 'Please keep this message.',
            },
        )

        self.assertEqual(response.status_code, 202)
        self.assertTrue(response.json()['success'])
        submission = ContactSubmission.objects.get()
        self.assertEqual(submission.delivery_status, 'failed')
        self.assertEqual(submission.delivery_error, 'SMTP unavailable')

    @override_settings(
        EMAIL_BACKEND='django.core.mail.backends.smtp.EmailBackend',
        EMAIL_HOST=None,
        EMAIL_HOST_USER=None,
        EMAIL_HOST_PASSWORD=None,
    )
    def test_missing_smtp_configuration_is_explicit_and_preserves_submission(self):
        response = self.client.post(
            reverse('contacts:contacts'),
            {
                'first_name': 'Linus',
                'last_name': 'Torvalds',
                'email': 'linus@example.test',
                'content': 'Configuration test.',
            },
        )

        self.assertEqual(response.status_code, 202)
        submission = ContactSubmission.objects.get()
        self.assertEqual(submission.delivery_status, 'failed')
        self.assertIn('EMAIL_HOST', submission.delivery_error)
        self.assertIn('EMAIL_HOST_USER', submission.delivery_error)
        self.assertIn('EMAIL_HOST_PASSWORD', submission.delivery_error)

    def test_submissions_are_read_only_in_admin(self):
        model_admin = admin.site._registry[ContactSubmission]

        self.assertFalse(model_admin.has_add_permission(None))
        self.assertFalse(model_admin.has_change_permission(None))
        self.assertFalse(model_admin.has_delete_permission(None))
