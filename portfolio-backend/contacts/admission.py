"""Atomic, database-backed admission for the public contact outbox."""
import ipaddress
import json
from datetime import timedelta

from django.conf import settings
from django.db import transaction
from django.utils import timezone
from django.utils.crypto import salted_hmac

from .models import ContactAdmissionLock, ContactSubmission


class AdmissionLimited(Exception):
    pass


def source_identity(address):
    # Forwarding headers are caller-controlled unless an ingress sanitizes them.
    # Use the direct peer; IPv6 privacy addresses share a /64 budget.
    try:
        address = ipaddress.ip_address(address)
        if isinstance(address, ipaddress.IPv6Address):
            if address.ipv4_mapped:
                return str(address.ipv4_mapped)
            return str(ipaddress.ip_network(f'{address}/64', strict=False))
        return str(address)
    except ValueError:
        return 'unknown'


def enqueue_contact(data, address):
    source_key = salted_hmac(
        'contact-source', source_identity(address), algorithm='sha256',
    ).hexdigest()
    payload_key = salted_hmac(
        'contact-payload',
        json.dumps({**data, 'email': data['email'].casefold()}, sort_keys=True),
        algorithm='sha256',
    ).hexdigest()

    # Bootstrap outside the admission transaction so its first statement is a
    # write. UPDATE locks the shared row on PostgreSQL and the writer on SQLite;
    # select_for_update alone would not serialize admission on SQLite.
    ContactAdmissionLock.objects.get_or_create(pk=1)
    with transaction.atomic():
        ContactAdmissionLock.objects.filter(pk=1).update(locked=True)
        now = timezone.now()
        submissions = ContactSubmission.objects.all()
        hourly = submissions.filter(submitted_at__gte=now - timedelta(hours=1))
        daily = submissions.filter(submitted_at__gte=now - timedelta(days=1))
        outstanding = submissions.filter(delivery_status__in=(
            ContactSubmission.DeliveryStatus.PENDING,
            ContactSubmission.DeliveryStatus.PROCESSING,
        ))
        duplicate = submissions.filter(
            payload_key=payload_key,
            submitted_at__gte=now - timedelta(seconds=settings.CONTACT_DUPLICATE_SECONDS),
        )
        if (
            hourly.filter(source_key=source_key).count() >= settings.CONTACT_SOURCE_HOURLY_LIMIT
            or hourly.count() >= settings.CONTACT_GLOBAL_HOURLY_LIMIT
            or daily.count() >= settings.CONTACT_GLOBAL_DAILY_LIMIT
            or outstanding.count() >= settings.CONTACT_MAX_PENDING
            or duplicate.exists()
        ):
            raise AdmissionLimited
        return submissions.create(source_key=source_key, payload_key=payload_key, **data)
