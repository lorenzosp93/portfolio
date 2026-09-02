from unittest.mock import patch

from django.contrib import admin
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

    def test_admin_form_exposes_hero_picture(self):
        model_admin = admin.site._registry[SiteSettings]

        self.assertIn('hero_picture', model_admin.get_form(None).base_fields)


class SubscriptionAdminTests(TestCase):
    def test_subscription_is_registered_as_read_only(self):
        model_admin = admin.site._registry[Subscription]

        self.assertFalse(model_admin.has_add_permission(None))
        self.assertFalse(model_admin.has_change_permission(None))
        self.assertIn('endpoint', model_admin.get_readonly_fields(None))


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
