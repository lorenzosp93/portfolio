"Define models for the resume app"
from django.core.validators import MaxValueValidator, MinValueValidator
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

SKILL_LEVELS = [
    (0, 'novice'),
    (1, 'basic'),
    (2, 'advanced'),
    (3, 'expert'),
    (4, 'professional')
]

PROJECT_STATUSES = [
    (0, 'Idea'),
    (1, 'Started'),
    (2, 'Ongoing'),
    (3, 'Completed'),
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

    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, null=True, blank=True)   
    object_id = models.UUIDField(null=True, blank=True)
    entry = GenericForeignKey()
    status = models.IntegerField(
        choices=PROJECT_STATUSES,
        default=3,
    )

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
        related_name='skills',
    )
    url = models.URLField(blank=True, null=True,)
    level = models.IntegerField(choices=SKILL_LEVELS)
    show_on_cv = models.BooleanField(
        default=False,
        verbose_name="Show on CV",
        help_text="Show as a bar on the printable CV; the bar length follows Level.",
    )

    class Meta:
        ordering = ['-level']

    @property
    def level_percent(self) -> int:
        "Bar length for the CV: novice 20% … professional 100%."
        return round((self.level + 1) * 100 / len(SKILL_LEVELS))


class Language(models.Model):
    "Spoken language shown on the printable CV"
    name = models.CharField(max_length=40, unique=True)
    proficiency = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(100)],
        verbose_name="Proficiency (%)",
        help_text="100 = native.",
    )
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ['order', 'name']

    def __str__(self):
        return self.name
