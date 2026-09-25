from rest_framework.serializers import (
    HyperlinkedModelSerializer,
    ModelSerializer,
    CharField,
    Serializer,
)
from shared.serializers import (
    AttachmentSerializer
)
from .models import (
    Education,
    Experience,
    Skill,
    Project,
    Entity,
    Keyword,
)
class SkillCategorySerializer(Serializer):
    "Category as {name, description}; keeps the API shape of the old model."
    name = CharField(source='get_category_display')
    description = CharField(source='category_description')


class SkillSerializer(ModelSerializer):
    category = SkillCategorySerializer(source='*')
    class Meta:
        model = Skill
        fields = ['name', 'category', 'url', 'level']


class CategorySkillSerializer(Serializer):
    name = CharField()
    description = CharField()
    skills = SkillSerializer(many=True)

class ProjectSerializer(HyperlinkedModelSerializer):
    attachments = AttachmentSerializer(many=True)
    status = CharField(source='get_status_display')
    class Meta:
        model = Project
        fields = [
            'uuid',
            'name',
            'description',
            'content',
            'attachments',
            'picture',
            'status'
        ]

class KeywordSerializer(HyperlinkedModelSerializer):
    class Meta:
        model = Keyword
        fields = [
            'name',
        ]

class EntitySerializer(HyperlinkedModelSerializer):
    class Meta:
        model = Entity
        fields = [
            'uuid',
            'name',
            'picture',
        ]

class EducationSerializer(HyperlinkedModelSerializer):
    entity = EntitySerializer()
    projects = ProjectSerializer(many=True)
    keywords = KeywordSerializer(many=True)
    attachments = AttachmentSerializer(many=True)
    class Meta:
        model = Education
        fields = [
            'uuid',
            'name',
            'start_date',
            'end_date',
            'location',
            'description',
            'entity',
            'projects',
            'keywords',
            'attachments',
            'current'
        ]

class ExperienceSerializer(HyperlinkedModelSerializer):
    entity = EntitySerializer()
    projects = ProjectSerializer(many=True)
    keywords = KeywordSerializer(many=True)
    attachments = AttachmentSerializer(many=True)
    class Meta:
        model = Experience
        fields = [
            'uuid',
            'name',
            'start_date',
            'end_date',
            'location',
            'department',
            'description',
            'key_achievements',
            'entity',
            'projects',
            'keywords',
            'attachments',
            'current'
        ]

class EntityEntriesSerializer(ModelSerializer):
    experiences = ExperienceSerializer(
        read_only=True, many=True, required=False
    )
    educations = EducationSerializer(
        read_only=True, many=True, required=False
    )
    class Meta:
        model = Entity
        fields = ['uuid', 'name', 'picture', 'experiences', 'educations']