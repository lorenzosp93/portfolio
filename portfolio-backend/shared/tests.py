from unittest.mock import patch

from django.test import TestCase

from .advanced_models import send_notifications_for_subscriptions
from .models import Keys, SiteSettings, Subscription


class SiteSettingsTests(TestCase):
    def test_settings_api_exposes_configurable_hero_picture(self):
        SiteSettings.objects.create(about_text="About")

        response = self.client.get('/api/settings/1/')

        self.assertEqual(response.status_code, 200)
        self.assertIn('hero_picture', response.json())
        self.assertIsNone(response.json()['hero_picture'])


class PushNotificationTests(TestCase):
    @patch('shared.advanced_models.webpush')
    def test_sends_standard_web_push_subscription_payload(self, webpush):
        keys = Keys.objects.create(p256dh='public-key', auth='auth-key')
        subscription = Subscription.objects.create(
            endpoint='https://push.example.test/subscription',
            keys=keys,
            user_agent='test-agent',
        )

        send_notifications_for_subscriptions([subscription.pk], {'body': 'Hello'})

        webpush.assert_called_once()
        subscription_info = webpush.call_args.args[0]
        self.assertEqual(
            subscription_info,
            {
                'endpoint': 'https://push.example.test/subscription',
                'keys': {'p256dh': 'public-key', 'auth': 'auth-key'},
            },
        )
