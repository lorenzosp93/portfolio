"Define resume models within admin interface"
from django.contrib import admin
from resume.models import (
    Education, Experience, Entity,
    Project, Skill, SkillCategory,
    Keyword
)
from resume.base_models import Attachment

# Register your models here.
admin.site.register(Education)
admin.site.register(Experience)
admin.site.register(Entity)
admin.site.register(Project)
admin.site.register(Skill)
admin.site.register(SkillCategory)
admin.site.register(Attachment)
admin.site.register(Keyword)
