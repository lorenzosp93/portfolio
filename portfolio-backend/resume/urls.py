"""
Define URL patterns for the resume app
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter

# from .views import (
#     ExperienceListView, ExperienceDetailView,
#     EducationListView, EducationDetailView,
#     SkillCategoryListView,
#     ProjectListView, ProjectDetailView,
# )
from .viewsets import (
    EntityViewSet,
    ExperienceViewSet,
    EducationViewSet,
    SkillViewSet,
    ProjectViewSet,
    EntityViewSet,
    KeywordViewSet,
    EntityEducationViewSet,
    EntityExperienceViewSet,
    CategorySkillViewSet,
)

app_name = 'resume'

router = DefaultRouter()
router.register(r'experience', ExperienceViewSet)
router.register(r'education', EducationViewSet)
router.register(r'skills', SkillViewSet)
router.register(r'projects', ProjectViewSet)
router.register(r'entity', EntityViewSet)
router.register(r'entity-entries/education', EntityEducationViewSet, 'entity-education')
router.register(r'entity-entries/experience', EntityExperienceViewSet, 'entity-experience')
router.register(r'keyword', KeywordViewSet)
router.register(r'skillcategory', CategorySkillViewSet, 'category-skill')

urlpatterns = [
    path('', include(router.urls))
]

# urlpatterns = [
#     path(
#         'experience/',
        
#         ExperienceListView.as_view(),
#         name='experience',
#     ),
#     path(
#         'experience/<slug:slug>/',
        
#         ExperienceDetailView.as_view(),
#         name='experience-detail',
#     ),
#     path(
#         'education/',
        
#         EducationListView.as_view(),
#         name='education'
#     ),
#     path(
#         'education/<slug:slug>/',
        
#         EducationDetailView.as_view(),
#         name='education-detail'
#     ),
#     path(
#         'skills/',
        
#         SkillCategoryListView.as_view(),
#         name='skills'
#     ),
#     path(
#         'project/<slug:slug>/',
        
#         ProjectDetailView.as_view(),
#         name='project-detail'
#     ),
#     path(
#         'project/',
#         ProjectListView.as_view(),
#         name='projects'
#     )
# ]
