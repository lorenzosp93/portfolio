"""
Define URL patterns for the blog app
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import viewsets
from .feeds import LatestPostsFeed

app_name = 'blog'

router = DefaultRouter()
router.register(r'post', viewsets.PostViewSet)
router.register(r'comment', viewsets.CommentViewSet)

urlpatterns = [
    path('feed/', LatestPostsFeed(), name='feed'),
    path('', include(router.urls))
]
