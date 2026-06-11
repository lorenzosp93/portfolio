from django.contrib import admin
from .models import SiteSettings, Attachment, SystemLog


class SystemLogAdmin(admin.ModelAdmin):
    list_display = ("created_at", "level", "logger_name", "message")
    list_filter = ("level", "logger_name", "created_at")
    search_fields = ("message", "traceback", "logger_name")
    readonly_fields = ("created_at", "level", "logger_name", "message", "traceback")
    ordering = ("-created_at",)

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False


admin.site.register(SiteSettings)
admin.site.register(Attachment)
admin.site.register(SystemLog, SystemLogAdmin)
