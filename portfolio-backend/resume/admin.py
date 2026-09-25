"Define resume models within admin interface"
from django.contrib import admin
from .models import (
    Education, Experience, Entity,
    Project, Skill,
    Keyword,
)
# Register your models here.
admin.site.register(Education)
admin.site.register(Experience)
admin.site.register(Entity)
admin.site.register(Project)
admin.site.register(Keyword)


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'level', 'show_on_cv')
    list_editable = ('category', 'level', 'show_on_cv')
    list_filter = ('category', 'show_on_cv')
