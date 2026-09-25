from rest_framework.viewsets import ReadOnlyModelViewSet, ModelViewSet
from rest_framework.permissions import AllowAny
from rest_framework.throttling import AnonRateThrottle
from .serializers import (
    SettingsSerializer,
    SubscriptionSerializer
)
from .models import (
    SiteSettings,
    Subscription
)

class SettingsViewSet(ReadOnlyModelViewSet):
    """
    This viewset automatically provides `list` and `retrieve`
    actions.

    A simple viewset to view Education entires.
    """
    queryset = SiteSettings.objects.all()
    serializer_class = SettingsSerializer

class SubscribeRateThrottle(AnonRateThrottle):
    scope = 'subscribe'


class SubscriptionViewset(ModelViewSet):
    permission_classes = [ AllowAny ]
    throttle_classes = [ SubscribeRateThrottle ]
    serializer_class = SubscriptionSerializer
    queryset = Subscription.objects.all()
    http_method_names = ['post']