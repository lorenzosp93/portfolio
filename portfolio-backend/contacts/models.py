from django.db import models


class ContactSubmission(models.Model):
    class DeliveryStatus(models.TextChoices):
        PENDING = 'pending', 'Pending'
        SENT = 'sent', 'Sent'
        FAILED = 'failed', 'Failed'

    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    email = models.EmailField()
    content = models.CharField(max_length=280)
    submitted_at = models.DateTimeField(auto_now_add=True, db_index=True)
    delivery_status = models.CharField(
        max_length=10,
        choices=DeliveryStatus.choices,
        default=DeliveryStatus.PENDING,
        db_index=True,
    )
    delivered_at = models.DateTimeField(blank=True, null=True)
    delivery_error = models.TextField(blank=True)

    class Meta:
        ordering = ('-submitted_at',)

    def __str__(self):
        return f'{self.first_name} {self.last_name} <{self.email}>'
