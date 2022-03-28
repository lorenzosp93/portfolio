from rest_framework.serializers import (
    HyperlinkedModelSerializer, 
    ModelSerializer
)
from .models import (
    Education,
    Experience,
    Skill,
    Project,
    Entity,
    Keyword
)

class SkillSerializer(ModelSerializer):
    class Meta:
        model = Skill
        fields = ['name', 'description', 'category', 'url', 'level']

class ProjectSerializer(HyperlinkedModelSerializer):
    class Meta:
        model = Project
        fields = [
            'id',
            'name',
            'description',
            'attachment',
            'picture',
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
            'id',
            'name',
            'picture',
        ]

class EducationSerializer(HyperlinkedModelSerializer):
    entity = EntitySerializer()
    projects = ProjectSerializer(many=True)
    keywords = KeywordSerializer(many=True)
    class Meta:
        model = Education
        fields = [
            'id',
            'name',
            'start_date',
            'end_date',
            'location',
            'description',
            'entity',
            'projects',
            'keywords',
            'attachment'
        ]

class ExperienceSerializer(HyperlinkedModelSerializer):
    entity = EntitySerializer()
    projects = ProjectSerializer(many=True)
    keywords = KeywordSerializer(many=True)
    class Meta:
        model = Experience
        fields = [
            'id',
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
            'attachment'
        ]
