"""Published article pages for readers, crawlers, and social previews."""
import re
from html import unescape
from urllib.parse import urljoin, urlsplit

from django.conf import settings
from django.shortcuts import get_object_or_404, render
from django.utils.html import strip_tags
from django.utils.safestring import mark_safe
from markdown_it import MarkdownIt

from .models import Post
from .frontend_assets import frontend_assets


def safe_url(value):
    return urlsplit(value).scheme.lower() in ('', 'https', 'http', 'mailto')


def render_article(content):
    parser = MarkdownIt('commonmark', {'html': False}).enable('table')
    parser.validateLink = safe_url
    return parser.render(content)


def article_description(content):
    return re.sub(r'\s+', ' ', unescape(strip_tags(render_article(content)))).strip()[:200]


def article(request, slug):
    post = get_object_or_404(Post.objects.select_related('created_by'), slug=slug, active=True)
    picture = urljoin(settings.BACKEND_HOST, post.picture.url) if post.picture else settings.FRONTEND_HOST.rstrip('/') + '/og-image.jpg'
    scripts, styles = frontend_assets()
    return render(request, 'blog/article.html', {
        'post': post,
        'body': mark_safe(render_article(post.content)),
        'description': article_description(post.content),
        'canonical_url': post.get_article_url(),
        'picture_url': picture,
        'portfolio_url': post.get_frontend_url(),
        'website': settings.FRONTEND_HOST.rstrip('/') + '/',
        'scripts': scripts, 'styles': styles,
    })


def sitemap(request):
    return render(request, 'blog/sitemap.xml', {
        'posts': Post.objects.filter(active=True).order_by('-created_at'),
    }, content_type='application/xml')
