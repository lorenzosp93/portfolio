from django.db import models
from portfolio.models import (
    TimeStampable,
    Localizable,
    Attachable,
    Described,
    Named,
    Authorable,
)

# Create your models here.
class Post(
        TimeStampable, Named, Described,
        Localizable, Attachable, Authorable
    ):
    "Define posts model"
    content = models.TextField()

    class Meta:
        ordering = ['-created_date']
