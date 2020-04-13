from __future__ import absolute_import, unicode_literals
from celery import shared_task

from django.conf import settings
from django.utils import timezone
from django.db.models import Q

from backend.models import Clan, Player
from backend.lib.official_api import ClanConsumer, PlayerConsumer, ConstantsConsumer


@shared_task
def refresh_constants_job():
    ConstantsConsumer().refresh_constants()


@shared_task
def refresh_launcher_job(force=False):
    now = timezone.now()
    time_delta = now - settings.REFRESH_RATE

    # TODO: Update constants periodically in another scheduled task

    # Check for empty database
    if not Clan.objects.filter(tag=settings.MAIN_CLAN).count():
        clan_refresher_job.delay(settings.MAIN_CLAN)

    # Refresh tracked clans
    db_clans = Clan.objects.filter(refresh=True)
    if not force:
        db_clans = db_clans.filter(Q(last_refresh__lte=time_delta) | Q(last_refresh__isnull=True))
    for clan in db_clans:
        clan_refresher_job.delay(clan.tag)

    # Refresh tracked players
    db_players = Player.objects.filter(refresh=True)
    if not force:
        db_players = db_players.filter(Q(last_refresh__lte=time_delta) | Q(last_refresh__isnull=True))
    for player in db_players:
        player_refresher_job.delay(player.tag)


@shared_task
def clan_refresher_job(tag):
    clan = None
    try:
        clan = Clan.objects.get(tag=tag)
        if clan.last_refresh and clan.last_refresh > (timezone.now() - settings.REFRESH_RATE):
            return
    except Clan.DoesNotExist:
        pass

    if clan is not None:
        associate_war_battles_job.delay(clan.id)

    ClanConsumer().read_clan(tag)
    for player in Clan.objects.get(tag=tag).get_players():
        player_refresher_job.delay(player.tag)


@shared_task
def associate_war_battles_job(clan_id):
    Clan.objects.get(id=clan_id).associate_war_battles()


@shared_task
def player_refresher_job(tag):
    try:
        player = Player.objects.get(tag=tag)
        if player.last_refresh and player.last_refresh > (timezone.now() - settings.REFRESH_RATE):
            return
    except Player.DoesNotExist:
        pass

    PlayerConsumer().read_player(tag)
