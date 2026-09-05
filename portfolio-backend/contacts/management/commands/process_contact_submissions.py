import signal
import threading

from django.conf import settings
from django.core.management.base import BaseCommand

from contacts.email import process_next_submission


class Command(BaseCommand):
    help = 'Deliver queued contact-form email notifications.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--once',
            action='store_true',
            help='Process the currently eligible queue and then exit.',
        )

    def handle(self, *args, **options):
        stopping = threading.Event()

        def request_stop(_signum, _frame):
            stopping.set()

        signal.signal(signal.SIGTERM, request_stop)
        signal.signal(signal.SIGINT, request_stop)

        while not stopping.is_set():
            processed = process_next_submission()
            if processed:
                continue
            if options['once']:
                break
            stopping.wait(settings.CONTACT_EMAIL_POLL_SECONDS)
