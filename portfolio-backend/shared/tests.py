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
