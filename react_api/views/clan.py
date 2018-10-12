from django.conf import settings
from django.db import models
from rest_framework.decorators import api_view
from rest_framework.response import Response

from react_api.models import Clan, PlayerClanStatsHistory, ClanWar
from react_api.repository import ClanRepository
from react_api.serializers.clan import (ClanWithDetailsSerializer,
                                        PlayerClanDetailsSerializer,
                                        PlayerInClanWarSerializer,
                                        ClanWarSerializer)
from react_api.serializers.misc import not_found_error


@api_view(['GET'])
def clans_list(request):
    if request.method == 'GET':
        try:
            main_clan = Clan.objects.get(tag=settings.MAIN_CLAN)
        except Clan.DoesNotExist:
            return not_found_error("clan", "main")
        clans = Clan.objects.exclude(tag=settings.MAIN_CLAN)
        if clans:
            family = ClanWithDetailsSerializer(clans, many=True).data
        else:
            family = []
        return Response({'main': ClanWithDetailsSerializer(main_clan, allow_null=True).data, 'family': family})


@api_view(['GET'])
def clan_info(request, tag):
    if request.method == 'GET':
        try:
            clan = Clan.objects.get(tag=tag)
        except Clan.DoesNotExist:
            return not_found_error("clan", tag)

        serializer = ClanWithDetailsSerializer(clan)
        return Response(serializer.data)


@api_view(['GET'])
def clan_members(request, tag):
    try:
        clan = Clan.objects.get(tag=tag)
    except Clan.DoesNotExist:
        return not_found_error("clan", tag)

    if request.method == 'GET':
        latest_stats_history_pks = PlayerClanStatsHistory.objects.values('player').annotate(
            max_id=models.Max('id')).values_list('max_id', flat=True)
        players = ClanRepository.get_players_in_clan_2(clan)\
            .prefetch_related(models.Prefetch('playerstatshistory_set',
                                              queryset=PlayerClanStatsHistory.objects.filter(pk__in=latest_stats_history_pks),
                                              to_attr='last_stat_list'))

        serializer = PlayerClanDetailsSerializer(players, many=True)
        return Response(serializer.data)


@api_view(['GET'])
def clan_wars(request, tag):
    try:
        clan = Clan.objects.get(tag=tag)
    except Clan.DoesNotExist:
        return not_found_error("clan", tag)

    players = ClanRepository.get_players_in_clan_2(clan)
    players_json = PlayerInClanWarSerializer(players, many=True)
    wars_json = ClanWarSerializer(ClanWar.objects.filter(clan=clan).order_by('-id'), many=True)
    return Response({'wars': wars_json.data, 'members': players_json.data})
