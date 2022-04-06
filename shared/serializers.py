from rest_framework.serializers import (
    HyperlinkedModelSerializer, 
    ModelSerializer
)
from .models import (
    SiteSettings,
    Attachment
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
