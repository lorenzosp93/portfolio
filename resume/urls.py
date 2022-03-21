"""
Define URL patterns for the resume app
"""
from django.urls import path
from .views import (
    ExperienceListView, ExperienceDetailView,
    EducationListView, EducationDetailView,
    SkillCategoryListView,
    ProjectListView, ProjectDetailView,
)

app_name = 'resume'

urlpatterns = [
    path(
        'experience/',
        
        ExperienceListView.as_view(),
        name='experience',
    ),
    path(
        'experience/<slug:slug>/',
        
        ExperienceDetailView.as_view(),
        name='experience-detail',
    ),
    path(
        'education/',
        
        EducationListView.as_view(),
        name='education'
    ),
    path(
        'education/<slug:slug>/',
        
        EducationDetailView.as_view(),
        name='education-detail'
    ),
    path(
        'skills/',
        
        SkillCategoryListView.as_view(),
        name='skills'
    ),
    path(
        'project/<slug:slug>/',
        
        ProjectDetailView.as_view(),
        name='project-detail'
    ),
    path(
        'project/',
        ProjectListView.as_view(),
        name='projects'
    )
]
