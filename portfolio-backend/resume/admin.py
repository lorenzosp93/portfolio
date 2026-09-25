"Define resume models within admin interface"
from django.contrib import admin
from .models import (
    Education, Experience, Entity,
    Project, Skill, SkillCategory,
    Keyword, Language,
)
# Register your models here.
admin.site.register(Education)
admin.site.register(Experience)
admin.site.register(Entity)
admin.site.register(Project)


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'level', 'cv_proficiency')
    list_editable = ('cv_proficiency',)


@admin.register(Language)
class LanguageAdmin(admin.ModelAdmin):
    list_display = ('name', 'proficiency', 'order')
    list_editable = ('proficiency', 'order')

admin.site.register(SkillCategory)
admin.site.register(Keyword)
