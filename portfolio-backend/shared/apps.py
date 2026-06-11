from django.apps import AppConfig


class SharedConfig(AppConfig):
    name = 'shared'

    def ready(self):
        from .logging import attach_database_log_handler

        attach_database_log_handler()
