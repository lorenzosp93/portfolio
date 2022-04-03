"Define models for the resume app"
from django.db import models
from django.contrib.contenttypes.fields import GenericForeignKey, GenericRelation
from django.contrib.contenttypes.models import ContentType
from django.shortcuts import reverse
from shared.models import (
    Serializable,
    TimeStampable,
    Datable,
    Localizable,
    Attachable,
    Described,
    Named,
    HasPicture,
    HasContent,
)

ENTITY_TYPES = [
    (0, 'Company'),
    (1, 'Institution')
]

class Entity(Serializable, Named, HasPicture):
    "Model for Entity, to be referenced by Education and Experience instances"

    type = models.IntegerField(
        choices=ENTITY_TYPES,
    )

    class Meta:
        verbose_name_plural = 'Entities'

class Project(
        Serializable,
        Named, Described, Attachable,
        TimeStampable, HasPicture, HasContent,
    ):
    "Model to define projects"

    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, null=True)   
    object_id = models.UUIDField()
    entry = GenericForeignKey()

    def get_absolute_url(self):
        return reverse("resume:project-detail", kwargs={"slug": self.slug})
    
    class Meta:
        ordering = ["-created_at"]
    
class Keyword(Named):
    "Model for keywords"

class Education(Serializable, Named, Datable, TimeStampable, 
    Localizable, Described, Attachable):
    "Model for Education entries"

    entity = models.ForeignKey(
        Entity,
        related_name='educations',
        related_query_name='education_related',
        on_delete=models.CASCADE,
        limit_choices_to={'type': 1}
    )
    projects = GenericRelation(
        Project
    )
    keywords = models.ManyToManyField(
        Keyword,
        blank=True
    )

    class Meta:
        verbose_name = "Education"
        ordering = ['-start_date']

    
    def get_absolute_url(self):
        return reverse("resume:education-detail", kwargs={"slug": self.slug})
    

class Experience(Serializable, Named, Datable, TimeStampable, 
    Localizable, Described, Attachable):
    "Model for Experience entries"

    entity = models.ForeignKey(
        Entity,
        related_name='experiences',
        related_query_name='experience_related',
        on_delete=models.CASCADE,
        limit_choices_to={'type': 0}
    )
    projects = GenericRelation(
        Project
    )
    keywords = models.ManyToManyField(
        Keyword,
        blank=True
    )
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
    

class Skill(Serializable, Named, TimeStampable):
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
