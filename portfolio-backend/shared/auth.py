"""Brute-force protection for Django admin / DRF browsable-API sign-in."""
from django.conf import settings
from django.contrib.auth.backends import ModelBackend
from django.contrib.auth.signals import user_logged_in, user_login_failed
from django.core.cache import cache
from django.core.exceptions import PermissionDenied
from django.dispatch import receiver
from django.utils.crypto import salted_hmac

from .client_ip import client_ip


def _key(request, username):
    identity = f'{client_ip(request) if request else ""}|{(username or "").casefold()}'
    return 'login-failures:' + salted_hmac('login-lockout', identity).hexdigest()


def is_locked(request, username):
    return cache.get(_key(request, username), 0) >= settings.ADMIN_LOGIN_MAX_FAILURES


class LockoutModelBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        if username is None:
            username = kwargs.get(self._username_field())
        if is_locked(request, username):
            # PermissionDenied stops Django from trying other backends.
            raise PermissionDenied('Too many failed sign-in attempts.')
        return super().authenticate(request, username=username, password=password, **kwargs)

    @staticmethod
    def _username_field():
        from django.contrib.auth import get_user_model
        return get_user_model().USERNAME_FIELD


@receiver(user_login_failed)
def record_failure(sender, credentials, request=None, **kwargs):
    key = _key(request, credentials.get('username'))
    failures = cache.get(key, 0) + 1
    cache.set(key, failures, settings.ADMIN_LOGIN_LOCKOUT_SECONDS)


@receiver(user_logged_in)
def clear_failures(sender, request, user, **kwargs):
    cache.delete(_key(request, user.get_username()))
