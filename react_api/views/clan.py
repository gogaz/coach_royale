from django.conf import settings
from django.db import models
from rest_framework.decorators import api_view
from rest_framework.response import Response

from react_api.models import Clan, PlayerClanStatsHistory
from react_api.repository import ClanRepository
from react_api.serializers.clan import ClanWithDetailsSerializer, PlayerClanDetailsSerializer


@api_view(['GET'])
def clans_list(request):
    if request.method == 'GET':
        try:
            main_clan = Clan.objects.filter(tag=settings.MAIN_CLAN)
        except Clan.DoesNotExist:
            return not_found_response("main")
        clans = Clan.objects.exclude(tag=settings.MAIN_CLAN)
        serializer = ClanWithDetailsSerializer(clans, many=True)
        return Response({'main': ClanWithDetailsSerializer(main_clan).data, 'family': serializer.data})


@api_view(['GET'])
def clan_info(request, tag):
    if request.method == 'GET':
        try:
            clan = Clan.objects.get(tag=tag)
        except Clan.DoesNotExist:
            return not_found_response(tag)

        serializer = ClanWithDetailsSerializer(clan)
        return Response(serializer.data)


@api_view(['GET'])
def clan_members(request, tag):
    try:
        clan = Clan.objects.get(tag=tag)
    except Clan.DoesNotExist:
        return not_found_response(tag)

    if request.method == 'GET':
        latest_stats_history_pks = PlayerClanStatsHistory.objects.values('player').annotate(
            max_id=models.Max('id')).values_list('max_id', flat=True)
        players = ClanRepository.get_players_in_clan_2(clan)\
            .prefetch_related(models.Prefetch('playerstatshistory_set',
                                              queryset=PlayerClanStatsHistory.objects.filter(pk__in=latest_stats_history_pks),
                                              to_attr='last_stat_list'))

        serializer = PlayerClanDetailsSerializer(players, many=True)
        return Response(serializer.data)


def not_found_response(tag):
    r = {'error': {'message': 'Clan %s was not found' % tag}}
    return Response(r, status=404)
