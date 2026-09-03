from django.contrib import admin
from .models import SiteSettings, Attachment, Subscription, SystemLog


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


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ("created_at", "endpoint", "user_agent")
    search_fields = ("endpoint", "user_agent")
    readonly_fields = ("created_at", "endpoint", "user_agent", "keys")
    ordering = ("-created_at",)

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False


@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    def has_add_permission(self, request):
        # The model always saves to pk=1. A second Add form would overwrite
        # that row, including clearing an existing picture when none is sent.
        return super().has_add_permission(request) and not SiteSettings.objects.exists()


admin.site.register(Attachment)
admin.site.register(SystemLog, SystemLogAdmin)
