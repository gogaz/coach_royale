from django.core.exceptions import ObjectDoesNotExist
from django.db.models import Q, F, ExpressionWrapper, DurationField
from django.utils import timezone

from react_api.models import *


class ClanRepository:
    @staticmethod
    def get_players_in_clan(db_clan: Clan, date=timezone.now()):
        return Player.objects.filter(
            Q(playerclanhistory__joined_clan__isnull=True, playerclanhistory__left_clan__gte=date)
            | Q(playerclanhistory__joined_clan__isnull=True, playerclanhistory__left_clan__isnull=True)
            | Q(playerclanhistory__joined_clan__lt=date, playerclanhistory__left_clan__gte=date)
            | Q(playerclanhistory__joined_clan__lt=date, playerclanhistory__left_clan__isnull=True),
            playerclanhistory__clan=db_clan)

    @staticmethod
    def get_war_for_collection_battle(db_clan: Clan, battle: Battle, prev_war=None):
        if prev_war and prev_war.date_start <= battle.time <= (prev_war.date_start + timezone.timedelta(hours=24)):
            return prev_war
        # search for matching war within last 24 hours
        try:
            return ClanWar.objects.get(clan=db_clan,
                                       date_start__lte=battle.time,
                                       date_end__gte=battle.time)
        except ObjectDoesNotExist:
            return None

    @staticmethod
    def get_players_battles_in_clan(db_clan: Clan):
        return Battle.objects.filter((Q(team__playerclanhistory__joined_clan__isnull=True)
                                      & Q(team__playerclanhistory__left_clan__gte=F('time')))
                                     | (Q(team__playerclanhistory__joined_clan__isnull=True)
                                        & Q(team__playerclanhistory__left_clan__isnull=True))
                                     | Q(team__playerclanhistory__joined_clan__lte=F('time'),
                                         team__playerclanhistory__left_clan__gte=F('time'))
                                     | Q(team__playerclanhistory__joined_clan__lte=F('time'),
                                         team__playerclanhistory__left_clan__isnull=True),
                                     team__playerclanhistory__clan=db_clan)

    @staticmethod
    def get_war_for_final_battle(db_clan: Clan, battle: Battle, prev_war=None):
        if prev_war and prev_war.date_start <= battle.time <= prev_war.date_start + timezone.timedelta(hours=48):
            return prev_war
        # search for matching war within last 48 hours
        try:
            return ClanWar.objects.get(clan=db_clan,
                                       date_start__lte=battle.time,
                                       date_end__gte=battle.time)
        except ObjectDoesNotExist:
            return None


class PlayerRepository:
    @staticmethod
    def get_clan_for_player(db_player: Player, date=timezone.now()):
        clan = Clan.objects.filter(
                (Q(playerclanhistory__joined_clan__isnull=True) & Q(playerclanhistory__left_clan__gte=date))
                | (Q(playerclanhistory__joined_clan__isnull=True) & Q(playerclanhistory__left_clan__isnull=True))
                | Q(playerclanhistory__joined_clan__lt=date, playerclanhistory__left_clan__gte=date)
                | Q(playerclanhistory__joined_clan__lt=date, playerclanhistory__left_clan__isnull=True),
                playerclanhistory__player=db_player)
        try:
            return clan.get()
        except ObjectDoesNotExist:
            return None


class TournamentRepository:
    @staticmethod
    def get_playable_tournaments():
        return Tournament.objects.filter(end_time__gt=timezone.now())\
                                        .annotate(remaining=ExpressionWrapper(F('end_time') - timezone.now(),
                                                                              output_field=DurationField())) \
                                        .annotate(midtime=ExpressionWrapper(F('duration') / 2,
                                                                            output_field=DurationField())) \
                                        .filter(remaining__gte=F('midtime'),
                                                open=True,
                                                current_players__lt=F('max_players')) \
                                        .order_by('-start_time')