from django.db import models
from datetime import datetime

# Create your models here.

class Company(models.Model):
    name = models.CharField(max_length = 100, primary_key = True)
    logo = models.ImageField(upload_to = 'logos/')

    class Meta:
        verbose_name_plural = 'Companies'

    def __str__(self):
        return self.name

class CV_Entry(models.Model):
    id = models.AutoField(primary_key = True)
    start_date = models.DateField()
    end_date = models.DateField()
    current = models.BooleanField(default = False)
    company = models.ForeignKey(Company, on_delete = models.CASCADE)
    location = models.CharField(max_length = 100)
    role = models.CharField(max_length = 100)
    descript = models.TextField()

    class Meta:
        ordering = ['-start_date']
        abstract = True


    def __str__(self):
        return self.role

class Education(CV_Entry):
    pass

class Experience(CV_Entry):
    department = models.CharField(max_length = 100, blank = True)
    key_achievements = models.TextField()

class Project(models.Model):
    during = models.ForeignKey(Education, on_delete = models.CASCADE)
    name = models.CharField(max_length = 100, primary_key = True)
    descript = models.TextField()
    attachment = models.FileField(upload_to = 'projects/')

    def __str__(self):
        return self.name

class Skill(models.Model):
    name = models.CharField(max_length = 100, primary_key = True)
    url = models.URLField()
    level = models.CharField(max_length = 30, choices = (
        (1, 'basic'),
        (2, 'advanced'),
        (3, 'expert'),
        (4, 'professional')
    ))
    def __str__(self):
        return self.name