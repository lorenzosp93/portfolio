from django.apps import AppConfig


class SharedConfig(AppConfig):
    name = 'shared'

    def ready(self):
        from . import auth  # noqa: F401  (registers lockout signal handlers)
        from .logging import attach_database_log_handler

        attach_database_log_handler()
