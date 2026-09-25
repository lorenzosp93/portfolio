import json
import logging

import requests
from django.apps import apps
from django.conf import settings
from django.db import models
from pywebpush import webpush, WebPushException

logger = logging.getLogger(__name__)

# Push services answer 404/410 when a subscription is gone for good.
EXPIRED_SUBSCRIPTION_STATUSES = {404, 410}

def send_notifications_for_subscriptions(
    subscriptions_list: list[str], payload: dict
) -> None:
    subscriptions = apps.get_model(
        'shared', 'Subscription').objects.filter(pk__in=subscriptions_list)

    for subscription in subscriptions:
        try:
            subscription_info = {
                'endpoint': subscription.endpoint,
                'keys': {
                    'p256dh': subscription.keys.p256dh,
                    'auth': subscription.keys.auth,
                },
            }
            webpush(
                subscription_info,
                json.dumps(payload),
                vapid_private_key=settings.WEBPUSH_SETTINGS.get('VAPID_PRIVATE_KEY'),
                vapid_claims={
                    "sub": f"mailto:{settings.WEBPUSH_SETTINGS.get('VAPID_ADMIN_EMAIL')}"},
                timeout=settings.WEB_PUSH_TIMEOUT_SECONDS,
            )
        except WebPushException as exc:
            status = getattr(exc.response, 'status_code', None)
            if status in EXPIRED_SUBSCRIPTION_STATUSES:
                subscription.delete()
            else:
                logger.warning('Web push failed for subscription %s: %s', subscription.pk, exc)
        except requests.RequestException as exc:
            # A slow or unreachable push service must not block publishing.
            logger.warning('Web push unreachable for subscription %s: %s', subscription.pk, exc)

class TriggersNotifications(models.Model):
    """Abstract mixin to trigger notification"""
    submit: models.Field = models.BooleanField(default=False)

    def save(self, *args, **kwargs) -> None:
        notify = self.submit
        self.submit = False
        # Persist first so the slug and picture URL exist in the payload.
        super().save(*args, **kwargs)
        if notify:
            self.send_notifications()

    def send_notifications(self) -> None:
        subscriptions = self.get_subscriptions()
        payload = self.build_payload()
        send_notifications_for_subscriptions(
            [*subscriptions.values_list('pk', flat=True)], payload)

    def get_frontend_url(self) -> str:
        return settings.FRONTEND_HOST.rstrip('/') + '/'

    def build_payload(self) -> dict[str, str | None]:
        image_link = ''
        if (picture := getattr(self, 'picture', None)):
            image_link = picture.url
        return {
            'title': f'New {self._meta.verbose_name}: {self.name}',
            'body': 'Tap to read it on lorenzosp.com.',
            'image': image_link,
            'url': self.get_frontend_url(),
        }

    def get_subscriptions(self) -> models.QuerySet:
        return apps.get_model('shared', 'Subscription').objects.all()

    class Meta:
        abstract = True
