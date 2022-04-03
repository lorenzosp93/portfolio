"Define abstract models to be used in all apps"
from tabnanny import verbose
import uuid
from django.db import models
from django.utils.text import slugify
from django.utils import timezone
from django.core.exceptions import ValidationError
from django.contrib.auth.models import User

class Serializable(models.Model):
    "Abstract model to define an uuid based id field"
    uuid = models.UUIDField(
        editable=False,
        default=uuid.uuid4
    )

    class Meta:
        abstract = True

class Named(models.Model):
    "Abstract model to define names and slug behavior"
    name = models.CharField(max_length=90, unique=True)
    slug = models.SlugField(max_length=100, editable=False)

    def save(self, **kwargs): # pylint: disable=W0221
        "Override save method to create slug from name"
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(**kwargs)

    def __str__(self):
        return self.name

    class Meta:
        abstract = True

class TimeStampable(models.Model):
    "Abstract model to define timestamps for the entries"
    created_at = models.DateTimeField(
        verbose_name="Created date",
        auto_now_add=True,
        editable=False,
    )
    modified_at = models.DateTimeField(
        verbose_name="Last modified date",
        auto_now=True,
        editable=False,
    )

    class Meta:
        abstract = True
        ordering = ['-created_at']

class Datable(models.Model):
    "Abstract model to define dates for the entries"
    start_date = models.DateField(
        verbose_name="Start date"
    )
    end_date = models.DateField(
        verbose_name="End date",
        blank=True,
        null=True,
    )
    current = models.BooleanField(
        verbose_name="Is current",
        default=False,
    )

    @property
    def end_date_display(self):
        "Display end date"
        if self.current:
            return "Present"
        if self.end_date:
            return self.end_date
        return "No end date"

    def save(self, **kwargs): # pylint: disable=W0221
        "Override save method to validate end date"
        if self.end_date:
            self.end_date_validation()
        self.start_date_validation()
        super().save(**kwargs)

    def end_date_validation(self):
        if self.end_date <= self.start_date:
            raise ValidationError(
                "End date: %(end)s cannot be before start date: %(start)s",
                params={"end": self.end_date, "start": self.start_date},
            )
        elif self.end_date > timezone.now().date():
            raise ValidationError(
                "End date: %(end)s cannot be in the future",
                params={"end": self.end_date},
            )

    def start_date_validation(self):
        if self.start_date > timezone.now().date():
            raise ValidationError(
                "Start date: %(start)s cannot be in the future",
                params={"start": self.start_date},
            )

    class Meta:
        abstract = True

class Localizable(models.Model):
    "Abstract model to define locations"
    location = models.CharField(
        max_length=50,
    )

    class Meta:
        abstract = True

class Described(models.Model):
    "Abstract model to define descriptions"
    description = models.TextField(
        blank=True,
        null=True,
    )

    class Meta:
        abstract = True


class Attachment(Named, Serializable):
    "Concrete model to define attachments"
    file = models.FileField(
        upload_to='attachments/',
        verbose_name="File",
    )

class Attachable(models.Model):
    "Abstract model to allow attachments"
    attachments = models.ManyToManyField(
        Attachment,
        verbose_name="attachment",
        related_name="%(app_label)s_%(class)s_related",
        related_query_name="%(app_label)s_%(class)ss",
        blank=True,
    )

    class Meta:
        abstract = True

class Authorable(models.Model):
    "Abstract model to describe the author"
    active = models.BooleanField(default=True)
    created_by = models.ForeignKey(
        User,
        verbose_name="Created by",
        on_delete=models.CASCADE,
        related_name="%(app_label)s_%(class)s_related_creator",
        related_query_name="%(app_label)s_%(class)s_created",
        editable=False,
    )
    modified_by = models.ForeignKey(
        User,
        verbose_name="Last modified by",
        on_delete=models.CASCADE,
        related_name="%(app_label)s_%(class)s_related_modifier",
        related_query_name="%(app_label)s_%(class)s_modified",
        editable=False,
    )

class HasPicture(models.Model):
    "Abstract class to capture a picture"
    picture = models.ImageField(
        verbose_name='Header picture',
        upload_to="pictures/"
    )

    class Meta:
        abstract = True

class HasContent(models.Model):
    "Abstract class to define content"
    content = models.TextField()

    class Meta:
        abstract = True

class SingletonBaseModel(models.Model):
    "Abstract class to implement the singleton design pattern"
    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        pass

    @classmethod
    def load(cls):
        obj, created = cls.objects.get_or_create(pk=1)
        return obj

class SiteSettings(SingletonBaseModel):
    "Concrete model for the settings for the website"
    about_text = models.TextField()

