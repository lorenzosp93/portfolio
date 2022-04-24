from django.db.models import Max
from rest_framework.viewsets import ReadOnlyModelViewSet
from rest_framework.pagination import LimitOffsetPagination
from .serializers import (
    KeywordSerializer,
    ProjectSerializer,
    EntitySerializer,
    EntityEntriesSerializer,
    CategorySkillSerializer,
    ExperienceSerializer,
    EducationSerializer,
    SkillSerializer,
)
from .models import (
    Education,
    Experience,
    Skill,
    Project,
    Entity,
    Keyword,
    SkillCategory
)

class EducationViewSet(ReadOnlyModelViewSet):
    """
    This viewset automatically provides `list` and `retrieve`
    actions.

    A simple viewset to view Education entires.
    """
    queryset = Education.objects.all()
    serializer_class = EducationSerializer
    pagination_class = LimitOffsetPagination

class ExperienceViewSet(ReadOnlyModelViewSet):
    """
    A simple viewset to view Experience entires.
    """
    queryset = Experience.objects.all()
    serializer_class = ExperienceSerializer
    pagination_class = LimitOffsetPagination

class SkillViewSet(ReadOnlyModelViewSet):
    """
    A simple viewset to view Skill entires.
    """
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer

class ProjectViewSet(ReadOnlyModelViewSet):
    """
    A simple viewset to view Project entires.
    """
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer

class KeywordViewSet(ReadOnlyModelViewSet):
    """
    A simple viewset to view Keyword entires.
    """
    queryset = Keyword.objects.all()
    serializer_class = KeywordSerializer

class EntityViewSet(ReadOnlyModelViewSet):
    """
    A simple viewset to view Entity entires.
    """
    queryset = Entity.objects.all()
    serializer_class = EntitySerializer

class EntityExperienceViewSet(ReadOnlyModelViewSet):
    """
    A viewset to return Experiences related to an Entity.
    """
    serializer_class = EntityEntriesSerializer
    queryset = Entity.objects.filter(type=0).annotate(max_date=Max('experience_related__start_date')).order_by('-max_date')

class EntityEducationViewSet(ReadOnlyModelViewSet):
    """
    A viewset to return Educations related to an Entity.
    """
    serializer_class = EntityEntriesSerializer
    queryset = Entity.objects.filter(type=1).annotate(max_date=Max('education_related__start_date')).order_by('-max_date')

class CategorySkillViewSet(ReadOnlyModelViewSet):
    """
    A viewset to return Skills related to a Category.
    """
    serializer_class = CategorySkillSerializer
    queryset = SkillCategory.objects.all()
