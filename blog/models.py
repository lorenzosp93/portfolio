"Define modules for the blog app"
from django.db import models
from resume.base_models import (
    TimeStampable,
    Localizable,
    Attachable,
    Named,
    Authorable,
    Pictured,
)

# Create your models here.
class Post(
        TimeStampable, Named, Pictured,
        Localizable, Attachable, Authorable
    ):
    "Define posts model"
    content = models.TextField()

    class Meta:
        ordering = ['-created_date']
