import clashroyale
from django.conf import settings
from django.core.management import BaseCommand

from react_api.helpers.api.tournament import refresh_open_tournaments


class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument('--verbose', action='store_true', help="enable verbose mode")
        parser.add_argument('--open', metavar='N', type=int, help="Read N*100 open tournaments")

    def handle(self, *args, **options):
        api_client = clashroyale.RoyaleAPI(settings.ROYALE_API_KEY, timeout=30)
        if options['open']:
            refresh_open_tournaments(self, options, api_client)
