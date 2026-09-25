"""Atom feed of published posts."""
from django.conf import settings
from django.contrib.syndication.views import Feed
from django.utils.feedgenerator import Atom1Feed
from django.utils.text import Truncator

from .models import Post


class LatestPostsFeed(Feed):
    feed_type = Atom1Feed
    title = "Lorenzo Spinelli — blog"
    subtitle = "New posts from lorenzosp.com"

    def link(self):
        return settings.FRONTEND_HOST.rstrip('/') + '/'

    def items(self):
        return Post.objects.filter(active=True).order_by('-created_at')[:20]

    def item_title(self, item):
        return item.name

    def item_description(self, item):
        return Truncator(item.content).words(60)

    def item_link(self, item):
        return item.get_frontend_url()

    def item_pubdate(self, item):
        return item.created_at
