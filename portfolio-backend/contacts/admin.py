from django.contrib import admin
from django.utils import timezone

from .models import ContactSubmission


@admin.register(ContactSubmission)
class ContactSubmissionAdmin(admin.ModelAdmin):
    list_display = (
        'submitted_at', 'first_name', 'last_name', 'email', 'delivery_status',
        'delivery_attempts',
    )
    list_filter = ('delivery_status', 'submitted_at')
    search_fields = ('first_name', 'last_name', 'email', 'content')
    readonly_fields = (
        'submitted_at', 'first_name', 'last_name', 'email', 'content',
        'delivery_status', 'delivered_at', 'delivery_error',
        'delivery_attempts', 'next_delivery_attempt_at', 'delivery_started_at',
    )
    ordering = ('-submitted_at',)
    actions = ('retry_delivery',)

    @admin.action(description='Retry delivery', permissions=('retry',))
    def retry_delivery(self, request, queryset):
        count = queryset.exclude(
            delivery_status=ContactSubmission.DeliveryStatus.SENT
        ).update(
            delivery_status=ContactSubmission.DeliveryStatus.PENDING,
            delivery_attempts=0,
            next_delivery_attempt_at=timezone.now(),
            delivery_started_at=None,
            delivery_error='',
        )
        self.message_user(request, f'{count} submission(s) queued for delivery.')

    def has_retry_permission(self, request):
        return request.user.has_perm('contacts.change_contactsubmission')

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
