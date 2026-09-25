from urllib.parse import urlsplit

from django.conf import settings
from rest_framework.serializers import (
    ModelSerializer,
    ValidationError,
)
from .models import (
    SiteSettings,
    Attachment,
    Subscription,
    Keys,
)

class AttachmentSerializer(ModelSerializer):
    class Meta:
        model = Attachment
        fields = [
            'uuid',
            'file'
        ]

class SettingsSerializer(ModelSerializer):
    class Meta:
        model = SiteSettings
        fields = [
            'about_text',
            'hero_picture',
        ]

class KeysSerializer(ModelSerializer):
    class Meta:
        model = Keys
        fields = '__all__'


class SubscriptionSerializer(ModelSerializer):
    keys = KeysSerializer()

    class Meta:
        model = Subscription
        fields = ['endpoint', 'keys']

    def validate_endpoint(self, value: str) -> str:
        parts = urlsplit(value)
        host = (parts.hostname or '').lower()
        allowed = any(
            host == suffix or host.endswith('.' + suffix)
            for suffix in settings.WEB_PUSH_ALLOWED_HOST_SUFFIXES
        )
        if parts.scheme != 'https' or not allowed or parts.port not in (None, 443):
            raise ValidationError('Unsupported push service endpoint.')
        return value

    def create(self, validated_data: dict):
        keys_data = validated_data.pop('keys')
        request = self.context.get('request')
        if request:
            user_agent: str = self.get_user_agent(request)
            keys = Keys.objects.create(**keys_data)
            subscription = Subscription.objects.create(
                user_agent=user_agent,
                keys=keys,
                **validated_data,
            )
            return subscription
        return None

    @staticmethod
    def get_user_agent(request) -> str:
        return request.META.get('HTTP_USER_AGENT', '')
