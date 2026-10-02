"Define modules for the blog app"
from django.conf import settings
from django.urls import reverse

from shared.models import (
    Serializable,
    TimeStampable,
    Localizable,
    Attachable,
    Named,
    Authorable,
    HasPicture,
    HasContent,
)
from shared.advanced_models import TriggersNotifications

# Create your models here.
class Post(
        TriggersNotifications, TimeStampable, Named, HasPicture, HasContent,
        Localizable, Attachable, Authorable, Serializable,
    ):
    "Define posts model"

    def get_article_url(self) -> str:
        return settings.FRONTEND_HOST.rstrip('/') + reverse('writing-article', kwargs={'slug': self.slug})

    def get_frontend_url(self) -> str:
        return f"{super().get_frontend_url()}?post={self.slug}"


class Comment(
        TimeStampable, Named, HasContent, Authorable, Serializable,
    ):
    "Define comment model"

