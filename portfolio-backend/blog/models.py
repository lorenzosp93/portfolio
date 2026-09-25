"Define modules for the blog app"
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

    def get_frontend_url(self) -> str:
        return f"{super().get_frontend_url()}?post={self.slug}"


class Comment(
        TimeStampable, Named, HasContent, Authorable, Serializable,
    ):
    "Define comment model"

