from rest_framework.viewsets import ReadOnlyModelViewSet, ModelViewSet
from rest_framework.pagination import LimitOffsetPagination
from .serializers import (
    PostSerializer,
    CommentSerializer,
)
from .models import (
    Post,
    Comment,
)

class PostViewSet(ReadOnlyModelViewSet):
    """
    This viewset automatically provides `list` and `retrieve`
    actions.

    A simple viewset to view Post entires.
    """
    pagination_class = LimitOffsetPagination
    queryset = Post.objects.filter(active=True).order_by('-created_at')
    serializer_class = PostSerializer

class CommentViewSet(ModelViewSet):
    """
    This viewset automatically provides `list` and `retrieve`
    actions.

    A simple viewset to view Comment entires.
    """
    queryset = Comment.objects.filter(active=True)
    serializer_class = CommentSerializer
    pagination_class = LimitOffsetPagination
