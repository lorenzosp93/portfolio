from rest_framework.serializers import (
    HyperlinkedModelSerializer, 
    ModelSerializer
)
from django.contrib.auth.models import User
from shared.serializers import (
    AttachmentSerializer
)
from .models import (
    Post,
    Comment,
    Subscription,
    Keys,
)
class SimpleUserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name']

class PostSerializer(HyperlinkedModelSerializer):
    attachments = AttachmentSerializer(many=True)
    created_by = SimpleUserSerializer()
    class Meta:
        model = Post
        fields = [
            'uuid',
            'name',
            'created_at',
            'location',
            'picture',
            'content',
            'attachments',
            'created_by',
        ]

class CommentSerializer(HyperlinkedModelSerializer):
    class Meta:
        model = Comment
        fields = [
            'uuid',
            'name',
            'created_at',
            'content',
            'created_by',
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

