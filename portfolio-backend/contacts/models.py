from django.db import models
from django.utils import timezone


class ContactSubmission(models.Model):
    class DeliveryStatus(models.TextChoices):
        PENDING = 'pending', 'Pending'
        PROCESSING = 'processing', 'Processing'
        SENT = 'sent', 'Sent'
        FAILED = 'failed', 'Failed'

    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    email = models.EmailField()
    content = models.CharField(max_length=280)
    submitted_at = models.DateTimeField(auto_now_add=True, db_index=True)
    delivery_status = models.CharField(
        max_length=12,
        choices=DeliveryStatus.choices,
        default=DeliveryStatus.PENDING,
        db_index=True,
    )
    delivered_at = models.DateTimeField(blank=True, null=True)
    delivery_error = models.TextField(blank=True)
    delivery_attempts = models.PositiveSmallIntegerField(default=0)
    next_delivery_attempt_at = models.DateTimeField(
        blank=True,
        default=timezone.now,
        db_index=True,
        null=True,
    )
    delivery_started_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        ordering = ('-submitted_at',)

    def __str__(self):
        return f'{self.first_name} {self.last_name} <{self.email}>'
