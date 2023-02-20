"""portfolio_web URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf.urls.static import static
from django.conf import settings
from rest_framework.routers import DefaultRouter
from shared import viewsets

router = DefaultRouter()
router.register(r'settings', viewsets.SettingsViewSet, 'settings')
router.register(r'subscribe', viewsets.SubscriptionViewset, 'subscribe')

urlpatterns = [
    path('api/resume/', include('resume.urls', namespace='resume')),
    path('api/site/', include(router.urls)),
    path('api/blog/', include('blog.urls', namespace='blog')),
    path('api/contacts/', include('contacts.urls', namespace='contacts')),
    path('api/admin/', admin.site.urls),
    path('api/health/', include('health_check.urls')),
    path('api/api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    path('api/', include(router.urls)),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
