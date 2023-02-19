"Define modules for the blog app"
from django.db import models
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

# Create your models here.
class Post(
        TimeStampable, Named, HasPicture, HasContent,
        Localizable, Attachable, Authorable, Serializable,
    ):
    "Define posts model"


class Comment(
        TimeStampable, Named, HasContent, Authorable, Serializable,
    ):
    "Define comment model"

class Keys(models.Model):
    p256dh= models.CharField(max_length=100)
    auth = models.CharField(max_length=30)


class Subscription(TimeStampable):
    endpoint= models.URLField()
    keys= models.OneToOneField(
        Keys, on_delete=models.CASCADE, null=True)
    user_agent= models.TextField()

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=[ 'user_agent', 'endpoint'],
                name='unique_subscription_per_device'
            ),
        ]
