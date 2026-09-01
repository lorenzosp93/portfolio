from django.core import mail
from django.test import TestCase, override_settings
from django.urls import reverse


@override_settings(
    EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend',
    EMAIL_TO='portfolio@example.test',
)
class ContactViewTests(TestCase):
    def test_valid_submission_sends_an_email(self):
        response = self.client.post(
            reverse('contacts:contacts'),
            {
                'first_name': 'Ada',
                'last_name': 'Lovelace',
                'email': 'ada@example.test',
                'content': 'Hello from a test.',
            },
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['success'], True)
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, ['portfolio@example.test'])

    def test_invalid_submission_returns_validation_errors(self):
        response = self.client.post(reverse('contacts:contacts'), {})

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()['success'], False)
        self.assertIn('errors', response.json())
