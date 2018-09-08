from django.db import models
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from react_api.models import Clan, ClanHistory, PlayerClanStatsHistory, Player
from react_api.repository import ClanRepository
from react_api.serializers.clan import ClanSerializer, ClanFullSerializer, PlayerClanDetailsSerializer


@api_view(['GET'])
def clans_list(request):
    if request.method == 'GET':
        clans = Clan.objects.all()
        serializer = ClanSerializer(clans, many=True)
        return Response(serializer.data)


@api_view(['GET'])
def clan_infos(request, tag):
    try:
        clan = Clan.objects.get(tag=tag)
    except Clan.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    serializer = ClanFullSerializer(clan)
    return Response(serializer.data)


@api_view(['GET'])
def clan_members(request, tag):
    try:
        clan = Clan.objects.get(tag=tag)
    except Clan.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        latest_stats_history_pks = PlayerClanStatsHistory.objects.values('player').annotate(
            max_id=models.Max('id')).values_list('max_id', flat=True)
        players = ClanRepository.get_players_in_clan_2(clan)\
            .prefetch_related(models.Prefetch('playerstatshistory_set',
                                              queryset=PlayerClanStatsHistory.objects.filter(pk__in=latest_stats_history_pks),
                                              to_attr='last_stat_list'))

        serializer = PlayerClanDetailsSerializer(players, many=True)
        return Response(serializer.data)
