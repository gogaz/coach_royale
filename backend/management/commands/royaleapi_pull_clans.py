import clashroyale
from django.conf import settings
from django.db.models import Q
from django.utils import timezone
from command_log.commands import LoggedCommand

from backend.helpers.api.clan import update_war_status, refresh_clan_details
from backend.helpers.api.helpers import run_refresh_method
from backend.models import Clan


class Command(LoggedCommand):
    def add_arguments(self, parser):
        parser.add_argument('--verbose', action='store_true', help="enable verbose mode")
        parser.add_argument('--force', action='store_true', help="enable verbose mode")
        parser.add_argument('--sleep', type=bool, help="no sleep between reads")
        parser.add_argument('--clan', type=str, help="refresh selected clan tag")
        parser.add_argument('--war', action='store_true', help="updates previous wars status")

    def do_command(self, *args, **options):
        api_client = clashroyale.RoyaleAPI(settings.ROYALE_API_KEY, timeout=30)
        now = timezone.now()

        db_clans = Clan.objects.filter(refresh=True)
        if not options['force']:
            db_clans = db_clans.filter(Q(last_refresh__lte=now - timezone.timedelta(minutes=30)) |
                                       Q(last_refresh__isnull=True) |
                                       Q(clanwar__date_end__lte=now, clanwar__date_end__day=now.day))

        if options['war']:
            for clan in db_clans:
                update_war_status(self, options, clan)
        else:
            run_refresh_method(self, options, refresh_clan_details, db_clans, api_client=api_client)
        if options['clan']:
            refresh_clan_details(self, options, None, api_client=api_client)
