from unittest.mock import patch
from io import BytesIO

from django.contrib import admin
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from django.urls import reverse
from PIL import Image

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


@override_settings(STORAGES={
    'default': {'BACKEND': 'django.core.files.storage.InMemoryStorage'},
    'staticfiles': {'BACKEND': 'django.contrib.staticfiles.storage.StaticFilesStorage'},
})
class SiteSettingsAdminSaveTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_superuser(
            username='settings-admin', password='test-only-password',
        )
        self.client.force_login(self.user)
        self.add_url = reverse('admin:shared_sitesettings_add')
        self.change_url = reverse('admin:shared_sitesettings_change', args=[1])

    def upload_picture(self, url):
        buffer = BytesIO()
        Image.new('RGB', (8, 8)).save(buffer, format='PNG')
        return self.client.post(url, {
            'about_text': 'About',
            'hero_picture': SimpleUploadedFile(
                'portrait.png', buffer.getvalue(), content_type='image/png',
            ),
            '_save': 'Save',
        })

    def assert_picture_saved(self):
        obj = SiteSettings.objects.get(pk=1)
        self.assertTrue(obj.hero_picture.name)
        self.assertTrue(obj.hero_picture.storage.exists(obj.hero_picture.name))
        response = self.client.get('/api/settings/1/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['hero_picture'],
                         'http://testserver' + obj.hero_picture.url)
        return obj.hero_picture.name

    def test_initial_admin_upload_is_persisted_and_exposed_by_api(self):
        self.assertEqual(self.client.get(self.add_url).status_code, 200)
        self.assertEqual(self.upload_picture(self.add_url).status_code, 302)
        self.assert_picture_saved()

    def test_picture_can_be_uploaded_to_existing_singleton(self):
        SiteSettings.objects.create(about_text='About')
        self.assertEqual(self.upload_picture(self.change_url).status_code, 302)
        self.assert_picture_saved()

    def test_text_only_edit_preserves_picture(self):
        self.upload_picture(self.add_url)
        original_name = self.assert_picture_saved()
        response = self.client.post(self.change_url, {
            'about_text': 'Updated', '_save': 'Save',
        })
        self.assertEqual(response.status_code, 302)
        self.assertEqual(self.assert_picture_saved(), original_name)
        self.assertEqual(SiteSettings.objects.get(pk=1).about_text, 'Updated')

    def test_second_add_cannot_overwrite_singleton_or_clear_picture(self):
        self.upload_picture(self.add_url)
        original_name = self.assert_picture_saved()
        self.assertEqual(self.client.get(self.add_url).status_code, 403)
        response = self.client.post(self.add_url, {
            'about_text': 'Overwrite', '_save': 'Save',
        })
        self.assertEqual(response.status_code, 403)
        self.assertEqual(SiteSettings.objects.count(), 1)
        self.assertEqual(SiteSettings.objects.get(pk=1).about_text, 'About')
        self.assertEqual(self.assert_picture_saved(), original_name)


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


class SubscriptionEndpointTests(TestCase):
    def subscribe(self, endpoint, **extra):
        return self.client.post('/api/subscribe/', {
            'endpoint': endpoint,
            'keys': {'p256dh': 'public-key', 'auth': 'auth-key'},
        }, content_type='application/json', **extra)

    def test_accepts_known_push_service(self):
        response = self.subscribe('https://fcm.googleapis.com/fcm/send/abc')
        self.assertEqual(response.status_code, 201)

    def test_rejects_internal_or_unknown_endpoints(self):
        for endpoint in (
            'http://fcm.googleapis.com/fcm/send/abc',
            'https://169.254.169.254/latest/meta-data',
            'https://portfolio-api.default.svc.cluster.local/api/',
            'https://evilfcm.googleapis.com.attacker.test/x',
            'https://fcm.googleapis.com:8443/x',
        ):
            with self.subTest(endpoint=endpoint):
                self.assertEqual(self.subscribe(endpoint).status_code, 400)
        self.assertFalse(Subscription.objects.exists())

    def test_subscription_creation_is_throttled(self):
        from django.core.cache import cache
        cache.clear()
        statuses = [
            self.subscribe(f'https://fcm.googleapis.com/fcm/send/{index}',
                           HTTP_USER_AGENT=f'agent-{index}').status_code
            for index in range(11)
        ]
        self.assertEqual(statuses[:10], [201] * 10)
        self.assertEqual(statuses[10], 429)


class PushDeliveryFailureTests(TestCase):
    def make_subscription(self):
        return Subscription.objects.create(
            endpoint='https://fcm.googleapis.com/fcm/send/x',
            keys=Keys.objects.create(p256dh='p', auth='a'),
            user_agent='agent',
        )

    def test_expired_subscription_is_deleted(self):
        from pywebpush import WebPushException
        subscription = self.make_subscription()
        response = type('Response', (), {'status_code': 410})()
        with patch('shared.advanced_models.webpush',
                   side_effect=WebPushException('gone', response=response)):
            send_notifications_for_subscriptions([subscription.pk], {})
        self.assertFalse(Subscription.objects.exists())

    def test_transient_failure_keeps_subscription(self):
        import requests
        subscription = self.make_subscription()
        with patch('shared.advanced_models.webpush', side_effect=requests.Timeout()):
            send_notifications_for_subscriptions([subscription.pk], {})
        self.assertTrue(Subscription.objects.exists())

    @patch('shared.advanced_models.webpush')
    def test_passes_timeout(self, webpush):
        subscription = self.make_subscription()
        send_notifications_for_subscriptions([subscription.pk], {})
        self.assertIn('timeout', webpush.call_args.kwargs)


@override_settings(TRUSTED_PROXY_NETWORKS=[__import__('ipaddress').ip_network('10.42.0.0/16')])
class ClientIpTests(TestCase):
    def resolve(self, remote, forwarded=None):
        from django.test import RequestFactory
        from .client_ip import client_ip
        extra = {'REMOTE_ADDR': remote}
        if forwarded is not None:
            extra['HTTP_X_FORWARDED_FOR'] = forwarded
        return client_ip(RequestFactory().get('/', **extra))

    def test_uses_forwarded_hop_from_trusted_proxy(self):
        self.assertEqual(self.resolve('10.42.0.5', '203.0.113.9'), '203.0.113.9')

    def test_ignores_spoofed_left_entries(self):
        self.assertEqual(self.resolve('10.42.0.5', '1.2.3.4, 203.0.113.9'), '203.0.113.9')

    def test_untrusted_peer_cannot_spoof(self):
        self.assertEqual(self.resolve('198.51.100.7', '203.0.113.9'), '198.51.100.7')


class AdminLockoutTests(TestCase):
    def setUp(self):
        from django.core.cache import cache
        cache.clear()
        get_user_model().objects.create_superuser(username='boss', password='right-password-123')

    def login(self, password):
        return self.client.post(reverse('admin:login'), {
            'username': 'boss', 'password': password, 'next': '/api/admin/',
        })

    @override_settings(ADMIN_LOGIN_MAX_FAILURES=3)
    def test_locks_after_repeated_failures_even_with_right_password(self):
        for _ in range(3):
            self.login('wrong')
        response = self.login('right-password-123')
        self.assertNotIn('_auth_user_id', self.client.session)
        self.assertEqual(response.status_code, 200)

    @override_settings(ADMIN_LOGIN_MAX_FAILURES=3)
    def test_success_before_limit_clears_failures(self):
        self.login('wrong')
        self.login('right-password-123')
        self.assertIn('_auth_user_id', self.client.session)
