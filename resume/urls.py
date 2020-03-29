"""
Define URL patterns for the resume app
"""
from django.urls import path
from . import views

app_name = 'resume'

urlpatterns = [
    path(
        'experience/',
        views.ExperienceListView.as_view(),
        name='experience',
    ),
    path(
        'experience/<slug:slug>/',
        views.ExperienceDetailView.as_view(),
        name='experience-detail',
    ),
    path(
        'education/',
        views.EducationListView.as_view(),
        name='education'
    ),
    path(
        'education/<slug:slug>/',
        views.EducationDetailView.as_view(),
        name='education-detail'
    ),
    path(
        'skills/',
        views.SkillCategoryListView.as_view(),
        name='skills'
    ),
    path(
        'project/<slug:slug>/',
        views.ProjectDetailView.as_view(),
        name='project-detail'
    )
]
