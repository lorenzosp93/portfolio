from rest_framework.serializers import (
    ModelSerializer
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
            'about_text'
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

    def create(self, validated_data: dict):
        keys_data = validated_data.pop('keys')
        request= self.context.get('request')
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

