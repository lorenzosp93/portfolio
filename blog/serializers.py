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
    Comment
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
