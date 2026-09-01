from unittest.mock import patch

from django.test import TestCase

from .advanced_models import send_notifications_for_subscriptions
from .models import Keys, Subscription


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
