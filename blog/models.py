"Define modules for the blog app"
from shared.models import (
    TimeStampable,
    Localizable,
    Attachable,
    Named,
    Authorable,
    HasPicture,
    HasContent,
)

# Create your models here.
class Post(
        TimeStampable, Named, HasPicture, HasContent,
        Localizable, Attachable, Authorable,
    ):
    "Define posts model"


class Comment(
        TimeStampable, Named, HasContent, Authorable,
    ):
    "Define comment model"
