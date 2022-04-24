from django.conf import Settings
from rest_framework.viewsets import ReadOnlyModelViewSet
from .serializers import (
    SettingsSerializer
)
from .models import (
    SiteSettings
)

class SettingsViewSet(ReadOnlyModelViewSet):
    """
    This viewset automatically provides `list` and `retrieve`
    actions.

    A simple viewset to view Education entires.
    """
    queryset = SiteSettings.objects.all()
    serializer_class = SettingsSerializer
