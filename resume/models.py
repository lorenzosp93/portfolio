"Define models for the resume app"
from django.db import models
from portfolio.models import (
    Datable,
    Localizable,
    Describable,
    Attachable,
    Named
)

class Company(Named):
    "Model for Company, to be referenced by Education and Experience instances"
    logo = models.ImageField(upload_to='logos/', blank=True)

    class Meta:
        verbose_name_plural = 'Companies'

class CVEntry(Named, Datable, Localizable, Describable):
    "Abstract model for CV entries"
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
    )

    class Meta:
        abstract = True

class Education(CVEntry):
    "Model for Education entries"

class Experience(CVEntry):
    "Model for Experience entries"
    department = models.CharField(max_length=100, blank=True)
    key_achievements = models.TextField(blank=True)

class Attachment(Named, Describable, Attachable):
    "Model to define attachments to Experiences"
    during = models.ForeignKey(
        Experience,
        related_name="attachments",
        on_delete=models.CASCADE,
    )

class Project(Named, Describable, Attachable):
    "Model to define projects during Education"
    during = models.ForeignKey(
        Education,
        related_name="projects",
        on_delete=models.CASCADE,
    )

class SkillCategory(Named, Describable):
    "Model to capture categories for skills"
    class Meta:
        verbose_name_plural = 'SkillCategories'

class Skill(Named):
    "Model for individual skills instances"
    category = models.ForeignKey(
        SkillCategory,
        on_delete=models.CASCADE,
    )
    url = models.URLField()
    level = models.IntegerField(choices=(
        (1, 'basic'),
        (2, 'advanced'),
        (3, 'expert'),
        (4, 'professional')
    ))
