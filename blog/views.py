"Define views for the blog app"
from django.views.generic import ListView, DetailView
from .models import Post
# Create your views here.
class PostListView(ListView):
    "Define list view for Post model"
    context_object_name = 'posts'
    model = Post
    template_name = 'mainpage/blog/blog.html'

class PostDetailView(DetailView):
    "Define detail view for Post model"
    model = Post
    template_name = 'mainpage/blog/post.html'
