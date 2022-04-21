"""
Define URL patterns for the resume app
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ContactView


app_name = 'contacts'


urlpatterns = [
    path('', ContactView.as_view())
]