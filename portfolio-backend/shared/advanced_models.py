import json
from django.db import models
from django.apps import apps
from pywebpush import webpush, WebPushException
from portfolio.settings import WEBPUSH_SETTINGS, FRONTEND_HOST

def send_notifications_for_subscriptions(
    subscriptions_list: list[str], payload: dict
) -> None:
    subscriptions = apps.get_model(
        'shared', 'Subscription').objects.filter(pk__in=subscriptions_list)

    for subscription in subscriptions:
        try:
            webpush(
                apps.get_model('shared', 'Subscription')(subscription).data,
                json.dumps(payload),
                vapid_private_key=WEBPUSH_SETTINGS.get('VAPID_PRIVATE_KEY'),
                vapid_claims={
                    "sub": f"mailto:{WEBPUSH_SETTINGS.get('VAPID_ADMIN_EMAIL')}"},
            )
        except WebPushException:
            subscription.delete()

class TriggersNotifications(models.Model):
    """Abstract mixin to trigger notification"""
    submit: models.Field = models.BooleanField(default=False)

    def save(self, *args, **kwargs) -> None:
        if self.submit:
            self.send_notifications()
            self.submit = False
        super().save(*args, **kwargs)

    def send_notifications(self) -> None:
        subscriptions = self.get_subscriptions()
        payload = self.build_payload()
        send_notifications_for_subscriptions(
            [*subscriptions.values_list('pk', flat=True)], payload)

    def build_payload(self) -> dict[str, str | dict[str, str] | None]:
        image_link = ''
        if (picture := getattr(self, 'picture', None)):
            image_link = picture.url
        return {
            'image': image_link,
            'body': "There is a new %(type)s for you: %(subject)s" % {'subject': self.name, 'type': self.__class__.__name__},
            'data': {
                'url': FRONTEND_HOST
            }
        }

    def get_subscriptions(self) -> models.QuerySet:
        return apps.get_model('shared', 'Subscription') \
                   .all()

    class Meta:
        abstract = True
