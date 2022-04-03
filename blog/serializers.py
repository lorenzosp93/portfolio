from rest_framework.serializers import (
    HyperlinkedModelSerializer, 
    ModelSerializer
)
from shared.serializers import (
    AttachmentSerializer
)
from .models import (
    Post,
    Comment
)

class PostSerializer(ModelSerializer):
    attachments = AttachmentSerializer(many=True)
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

class CommentSerializer(ModelSerializer):
    class Meta:
        model = Comment
        fields = [
            'uuid',
            'name',
            'created_at',
            'content',
            'created_by',
        ]
