"""
Define URL patterns for the blog app
"""
from django.urls import path
from . import views

app_name = 'blog'

urlpatterns = [
    path(
        'list/',
        views.PostListView.as_view(),
        name='blog',
    ),
    path(
        'list/<slug:slug>/',
        views.PostDetailView.as_view(),
        name='post',
    )
]
