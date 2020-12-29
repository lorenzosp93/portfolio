"Define models for the resume app"
from django.db import models
from django.shortcuts import reverse
from .base_models import (
    TimeStampable,
    Datable,
    Localizable,
    Attachable,
    Described,
    Named,
    HasPicture,
    HasContent,
)


class Company(Named, HasPicture):
    "Model for Company, to be referenced by Education and Experience instances"

    class Meta:
        verbose_name_plural = 'Companies'

class Project(
        Named, Described, Attachable,
        TimeStampable, HasPicture, HasContent,
    ):
    "Model to define projects"

    def get_absolute_url(self):
        return reverse("resume:project-detail", kwargs={"slug": self.slug})
    
    class Meta:
        ordering = ["-created_date"]
    

class CVEntry(Named, Datable, TimeStampable,
              Localizable, Described, Attachable):
    "Abstract model for CV entries"

    company = models.ForeignKey(
        Company,
        related_name='%(class)s_related',
        related_query_name='%(class)ss',
        on_delete=models.CASCADE,
    )

    project = models.ManyToManyField(
        Project,
        related_name='%(class)s_related',
        related_query_name='%(class)ss',
        blank=True,
    )

    class Meta:
        abstract = True

class Education(CVEntry):
    "Model for Education entries"
    class Meta:
        verbose_name = "Education"
        ordering = ['-start_date']

    
    def get_absolute_url(self):
        return reverse("resume:education-detail", kwargs={"slug": self.slug})
    

class Experience(CVEntry):
    "Model for Experience entries"
    department = models.CharField(max_length=100, blank=True)
    key_achievements = models.TextField(blank=True)
    class Meta:
        verbose_name = "Experience"
        ordering = ['-start_date']

    def get_absolute_url(self):
        return reverse("resume:experience-detail", kwargs={"slug": self.slug})

class SkillCategory(Named, Described):
    "Model to capture categories for skills"
    class Meta:
        verbose_name_plural = 'Skill Categories'
    

class Skill(Named, TimeStampable):
    "Model for individual skills instances"
    category = models.ForeignKey(
        SkillCategory,
        on_delete=models.CASCADE,
    )
    url = models.URLField(blank=True, null=True,)
    level = models.IntegerField(choices=(
        (1, 'basic'),
        (2, 'advanced'),
        (3, 'expert'),
        (4, 'professional')
    ))
