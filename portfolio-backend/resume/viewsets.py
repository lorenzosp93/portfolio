from django.db.models import Max
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from shared.models import SiteSettings
from rest_framework.viewsets import ReadOnlyModelViewSet, ViewSet
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
    TimelineCopySerializer,
    TimelineEducationSerializer,
    TimelineExperienceSerializer,
)
from .models import (
    Education,
    Experience,
    Skill,
    Project,
    Entity,
    Keyword,
    SkillCategory,
    SKILL_CATEGORY_DESCRIPTIONS,
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
    pagination_class = LimitOffsetPagination

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

class CategorySkillViewSet(ViewSet):
    """
    Skills grouped by category, in category order; empty categories omitted.
    """
    queryset = Skill.objects.all()  # for DjangoModelPermissionsOrAnonReadOnly

    def list(self, request):
        grouped = {value: [] for value in SkillCategory.values}
        for skill in self.queryset.all():
            grouped.setdefault(skill.category, []).append(skill)
        data = [
            {
                'name': SkillCategory(value).label,
                'description': SKILL_CATEGORY_DESCRIPTIONS[value],
                'skills': skills,
            }
            for value, skills in grouped.items()
            if skills and value in SkillCategory.values
        ]
        return Response(CategorySkillSerializer(data, many=True).data)


class TimelineViewSet(ViewSet):
    "Complete, oldest-first journey. Pagination would change the path mid-scroll."
    permission_classes = [AllowAny]
    http_method_names = ['get', 'head', 'options']

    def list(self, request):
        entries = []
        for model, serializer in (
            (Education, TimelineEducationSerializer), (Experience, TimelineExperienceSerializer),
        ):
            queryset = model.objects.select_related('entity').prefetch_related(
                'keywords', 'attachments', 'projects__attachments',
            )
            entries.extend(serializer(queryset, many=True, context={'request': request}).data)
        entries.sort(key=lambda entry: (entry['start_date'], entry['kind'], entry['uuid']))
        return Response({
            'copy': TimelineCopySerializer(SiteSettings.load()).data,
            'entries': entries,
        })
