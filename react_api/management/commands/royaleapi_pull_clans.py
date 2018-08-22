from django.core.management import BaseCommand
from django.db.models import Q
from django.utils import timezone

from react_api.management.commands.royaleapi_pull import refresh_clan_details, update_war_status, run_refresh_method
from react_api.models import Clan


class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument('--verbose', action='store_true', help="enable verbose mode")
        parser.add_argument('--force', action='store_true', help="enable verbose mode")
        parser.add_argument('--sleep', type=bool, help="no sleep between reads")
        parser.add_argument('--clan', type=str, help="refresh selected clan tag")
        parser.add_argument('--war', action='store_true', help="updates previous wars status")

    def handle(self, *args, **options):
        db_clans = Clan.objects.filter(refresh=True)
        if not options['force']:
            db_clans = db_clans.filter(Q(last_refresh__lte=timezone.now() - timezone.timedelta(hours=2))
                                       | Q(last_refresh__isnull=True))

        if options['war']:
            for clan in db_clans:
                update_war_status(self, options, clan)
        else:
            run_refresh_method(self, options, refresh_clan_details, db_clans)
        if options['clan']:
            refresh_clan_details(self, options, None)
