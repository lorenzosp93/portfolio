"Define resume models within admin interface"
from django.contrib import admin
from .models import (
    Education, Experience, Entity,
    Project, Skill,
    Keyword,
)
# Register your models here.
@admin.register(Education, Experience)
class TimelineEntryAdmin(admin.ModelAdmin):
    list_display = ('name', 'entity', 'start_date', 'transition_motif')
    list_filter = ('entity', 'transition_motif')

    def get_fieldsets(self, request, obj=None):
        timeline = ('timeline_summary', 'narrative_heading', 'narrative_body', 'transition_motif')
        fields = [field for field in self.get_fields(request, obj) if field not in timeline]
        return [(None, {'fields': fields}), ('Timeline presentation', {'fields': timeline})]

admin.site.register(Entity)
admin.site.register(Project)
admin.site.register(Keyword)


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'level', 'show_on_cv')
    list_editable = ('category', 'level', 'show_on_cv')
    list_filter = ('category', 'show_on_cv')
