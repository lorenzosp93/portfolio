"Define resume models within admin interface"
from django.contrib import admin
from .models import (
    Education, Experience, Entity,
    Project, Skill, SkillCategory,
    Keyword
)
# Register your models here.
admin.site.register(Education)
admin.site.register(Experience)
admin.site.register(Entity)
admin.site.register(Project)
admin.site.register(Skill)
admin.site.register(SkillCategory)
admin.site.register(Keyword)
