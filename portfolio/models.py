"Define abstract models to be used in all apps"
from django.db import models
from django.utils.text import slugify
from django.utils import timezone
from django.core.exceptions import ValidationError


class Datable(models.Model):
    "Abstract model to define dates for the entries"
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)
    current = models.BooleanField(default=False)

    @property
    def end_date_display(self):
        "Display end date"
        if self.current:
            return "Present"
        elif self.end_date:
            return self.end_date
        else:
            return "No end date"

    def save(self, **kwargs): # pylint: disable=W0221
        "Override save method to validate end date"
        if self.end_date:
            if self.end_date <= self.start_date:
                raise ValidationError(
                    f"End date: {self.end_date} cannot be before start date: {self.start_date}"
                )
            elif self.end_date > timezone.now():
                raise ValidationError(
                    f"End date: {self.end_date} cannot be in the future"
                )
        elif self.start_date > timezone.now():
            raise ValidationError(
                f"Start date: {self.start_date} cannot be in the future"
            )
        super().save(**kwargs)

    class Meta:
        abstract = True
        ordering = ['-start_date']

class Localizable(models.Model):
    "Abstract model to define locations"
    location = models.CharField(max_length=50)

    class Meta:
        abstract = True

class Describable(models.Model):
    "Abstract model to define descriptions"
    descript = models.TextField(blank=True)

    class Meta:
        abstract = True

class Attachable(models.Model):
    "Abstract model to define attachments"
    attachment = models.FileField(
        upload_to='attachments/',
        blank=True,
        null=True
    )

    class Meta:
        abstract = True

class Named(models.Model):
    "Abstract model to define names and slug behavior"
    name = models.CharField(max_length=30)
    slug = models.SlugField(max_length=50, editable=False)

    def save(self, **kwargs): # pylint: disable=W0221
        "Override save method to create slug from name"
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(**kwargs)

    def __str__(self):
        return self.name

    class Meta:
        abstract = True
