import clashroyale
from django.conf import settings
from django.core.management import BaseCommand

from react_api.helpers.api.tournament import refresh_open_tournaments


class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument('--verbose', action='store_true', help="enable verbose mode")
        parser.add_argument('--open', action='store_true', help="Read open tournaments")
        parser.add_argument('--max', type=int, help="Max pages to read from API")

    def handle(self, *args, **options):
        api_client = clashroyale.RoyaleAPI(settings.ROYALE_API_KEY, timeout=30)
        if options['open']:
            refresh_open_tournaments(self, options, api_client)
