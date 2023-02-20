"""
Define URL patterns for the blog app
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import viewsets

app_name = 'blog'

router = DefaultRouter()
router.register(r'post', viewsets.PostViewSet)
router.register(r'comment', viewsets.CommentViewSet)

urlpatterns = [
    path('', include(router.urls))
]
