"Define modules for the blog app"
from django.db import models
from resume.base_models import (
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
        Localizable, Attachable, Authorable
    ):
    "Define posts model"

    class Meta:
        ordering = ['-created_date']
