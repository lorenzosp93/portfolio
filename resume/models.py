from django.db import models
from portfolio.models import (
    TimeStampable, 
    Localizable, 
    Describable, 
    Attachable,
    Named
)

class Company(Named):
    logo = models.ImageField(upload_to='logos/', blank=True)

    class Meta:
        verbose_name_plural = 'Companies'

class CV_Entry(Named, TimeStampable, Localizable, Describable):
    company = models.ForeignKey(
        Company, 
        on_delete=models.CASCADE,
    )

    class Meta:
        abstract = True

class Education(CV_Entry):
    pass

class Experience(CV_Entry):
    department = models.CharField(max_length=100, blank=True)
    key_achievements = models.TextField(blank=True)

class Attachment(Named, Describable, Attachable):
    during = models.ForeignKey(
        Experience, 
        related_name="attachments", 
        on_delete=models.CASCADE,
    )

class Project(Named, Describable, Attachable):
    during = models.ForeignKey(
        Education, 
        related_name="projects", 
        on_delete=models.CASCADE,
    )

class SkillCategory(Named, Describable):
    class Meta:
        verbose_name_plural = 'SkillCategories'

class Skill(Named):
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