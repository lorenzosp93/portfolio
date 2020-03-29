"Define resume models within admin interface"
from django.contrib import admin
from resume.models import (
    Education, Experience, Company,
    Project, Skill, SkillCategory,
)
from resume.base_models import Attachment

# Register your models here.
admin.site.register(Education)
admin.site.register(Experience)
admin.site.register(Company)
admin.site.register(Project)
admin.site.register(Skill)
admin.site.register(SkillCategory)
admin.site.register(Attachment)
