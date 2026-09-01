"""
Define URL patterns for the resume app
"""
from django.urls import path 
from .views import ContactView, get_csrf_token


app_name = 'contacts'


urlpatterns = [
    path('get-token/', get_csrf_token, name='get-token'),
    path('', ContactView.as_view(), name='contacts'),
]
