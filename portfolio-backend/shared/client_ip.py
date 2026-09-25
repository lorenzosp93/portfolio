"""Resolve the visitor address behind trusted reverse proxies."""
import ipaddress

from django.conf import settings


def _parse(value):
    try:
        return ipaddress.ip_address(value.strip())
    except ValueError:
        return None


def _is_trusted(address):
    return any(address in network for network in settings.TRUSTED_PROXY_NETWORKS)


def client_ip(request):
    """Return the first untrusted hop, reading X-Forwarded-For right to left.

    Forwarding headers are only honoured when the direct peer is a configured
    proxy, so a direct caller cannot spoof its address.
    """
    peer = request.META.get('REMOTE_ADDR', '')
    address = _parse(peer)
    if address is None or not _is_trusted(address):
        return peer
    forwarded = request.META.get('HTTP_X_FORWARDED_FOR', '')
    for hop in reversed(forwarded.split(',')):
        hop_address = _parse(hop)
        if hop_address is None:
            break
        if not _is_trusted(hop_address):
            return str(hop_address)
    return peer
