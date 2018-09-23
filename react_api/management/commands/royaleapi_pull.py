import clashroyale
from django.conf import settings
from django.core.management import BaseCommand
from django.db.models import Q
from django.utils import timezone

from react_api.helpers.api.clan import refresh_clan_details
from react_api.helpers.api.helpers import run_refresh_method
from react_api.helpers.api.player import refresh_player_profile
from react_api.models import Clan, Player


class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument('--verbose', action='store_true', help="enable verbose mode")
        parser.add_argument('--clan', type=str, help="add clan tag to database and enable auto-refresh")
        parser.add_argument('--player', type=str, help="add player tag to database and enable auto-refresh")
        parser.add_argument('--force', action='store_true', help="Force update without taking care of last refresh")
        parser.add_argument('--battles', action='store_true', help="Refresh player war battles")

    def handle(self, *args, **options):
        api_client = clashroyale.RoyaleAPI(settings.ROYALE_API_KEY, timeout=30)

        if not Clan.objects.filter(tag=settings.MAIN_CLAN).count() and options['clan'] != settings.MAIN_CLAN:
            opts = options
            opts['clan'] = settings.MAIN_CLAN
            run_refresh_method(self, opts, refresh_clan_details, [None], api_client=api_client)

        db_clans = Clan.objects.filter(refresh=True)
        if not options['force']:
            db_clans = db_clans.filter(Q(last_refresh__lte=timezone.now() - timezone.timedelta(minutes=60)) | Q(last_refresh__isnull=True))

        run_refresh_method(self, options, refresh_clan_details, db_clans, api_client=api_client)
        if options['clan']:
            run_refresh_method(self, options, refresh_clan_details, [None], api_client=api_client)

        db_players = Player.objects.filter((Q(refresh=True) | Q(playerclanhistory__clan__refresh=True, playerclanhistory__left_clan__isnull=True)))
        if not options['force']:
            db_players = db_players.filter(Q(last_refresh__lte=timezone.now() - timezone.timedelta(minutes=60)) | Q(last_refresh__isnull=True))

        run_refresh_method(self, options, refresh_player_profile, db_players.order_by('last_refresh'))

        if options['player']:
            run_refresh_method(self, options, refresh_player_profile, [None], api_client=api_client)
