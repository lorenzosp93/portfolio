from django.contrib import admin

from .models import ContactSubmission


@admin.register(ContactSubmission)
class ContactSubmissionAdmin(admin.ModelAdmin):
    list_display = (
        'submitted_at', 'first_name', 'last_name', 'email', 'delivery_status',
    )
    list_filter = ('delivery_status', 'submitted_at')
    search_fields = ('first_name', 'last_name', 'email', 'content')
    readonly_fields = (
        'submitted_at', 'first_name', 'last_name', 'email', 'content',
        'delivery_status', 'delivered_at', 'delivery_error',
    )
    ordering = ('-submitted_at',)

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
