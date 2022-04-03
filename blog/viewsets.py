from rest_framework.viewsets import ReadOnlyModelViewSet, ModelViewSet
from .serializers import (
    PostSerializer,
    CommentSerializer
)
from .models import (
    Post,
    Comment
)

class PostViewSet(ReadOnlyModelViewSet):
    """
    This viewset automatically provides `list` and `retrieve`
    actions.

    A simple viewset to view Post entires.
    """
    queryset = Post.objects.filter(active=True)
    serializer_class = PostSerializer

class CommentViewSet(ModelViewSet):
    """
    This viewset automatically provides `list` and `retrieve`
    actions.

    A simple viewset to view Comment entires.
    """
    queryset = Comment.objects.filter(active=True)
    serializer_class = CommentSerializer
