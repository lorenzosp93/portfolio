import logging


class DatabaseLogHandler(logging.Handler):
    """Persist warning and error logs to the SystemLog model for admin review."""

    def emit(self, record):
        try:
            from shared.models import SystemLog

            SystemLog.objects.create(
                level=record.levelname,
                logger_name=record.name,
                message=record.getMessage(),
                traceback=self.format(record) if record.exc_info else "",
            )
        except Exception:
            # Never let logging failures break the application or recurse into logging.
            pass


def attach_database_log_handler():
    """Attach the database log handler once to application loggers."""
    handler_name = "database-system-log"

    for logger_name in ("django", "contacts"):
        logger = logging.getLogger(logger_name)
        if any(getattr(handler, "name", None) == handler_name for handler in logger.handlers):
            continue

        handler = DatabaseLogHandler(level=logging.WARNING)
        handler.name = handler_name
        handler.setFormatter(
            logging.Formatter("%(asctime)s %(levelname)s %(name)s %(message)s")
        )
        logger.addHandler(handler)
