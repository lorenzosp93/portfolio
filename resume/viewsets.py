from rest_framework.viewsets import ReadOnlyModelViewSet
from .serializers import (
    EducationSerializer,
    ExperienceSerializer,
    KeywordSerializer,
    SkillSerializer,
    ProjectSerializer,
    EntitySerializer
)
from .models import (
    Education,
    Experience,
    Skill,
    Project,
    Entity,
    Keyword
)

class EducationViewSet(ReadOnlyModelViewSet):
    """
    This viewset automatically provides `list` and `retrieve`
    actions.

    A simple viewset to view Education entires.
    """
    queryset = Education.objects.all()
    serializer_class = EducationSerializer

class ExperienceViewSet(ReadOnlyModelViewSet):
    """
    A simple viewset to view Experience entires.
    """
    queryset = Experience.objects.all()
    serializer_class = ExperienceSerializer

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
