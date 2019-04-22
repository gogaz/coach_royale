import clashroyale
from django.conf import settings
from django.core.management import BaseCommand
from django.utils import timezone

from react_api.helpers.api.tournament import refresh_open_tournaments
from react_api.models import Tournament


class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument('--verbose', action='store_true', help="enable verbose mode")
        parser.add_argument('--open', action='store_true', help="Read open tournaments")
        parser.add_argument('--max', type=int, default=-1, help="Max pages to read from API")

    def handle(self, *args, **options):
        api_client = clashroyale.RoyaleAPI(settings.ROYALE_API_KEY, timeout=30)
        if options['open']:
            result = refresh_open_tournaments(api_client, **options)
            if options['verbose']:
                if not result.success:
                    self.stderr.write("#ERR: %s" % result.error)
                else:
                    self.stdout.write("#INFO: Read %d new tournaments" % result.count)

        expired = Tournament.objects.filter(end_time__lte=timezone.now())
        if options['verbose']:
            if expired.count():
                self.stdout.write("#INFO: Removing %d expired tournaments" % expired.count())
        expired.delete()
