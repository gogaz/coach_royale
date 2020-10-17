from django.db.models import F
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from backend.models import Player, PlayerStatsHistory, PlayerClanWar
from backend.serializers.player import PlayerSerializer, PlayerClanWarSerializer, PlayerStatsHistorySerializer


@api_view(['GET'])
def player_info(request, tag):
    try:
        player = Player.objects.get(tag=tag)
    except Player.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(PlayerSerializer(player).data)


@api_view(["GET", "POST"])
def player_activity(request, tag):
    try:
        player = Player.objects.get(tag=tag)
    except Player.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        ps = PlayerStatsHistory.objects.filter(player=player).order_by('-id')

        stats = ps.values('current_trophies', 'total_games', 'total_donations', 'timestamp', 'wins', 'losses', 'draws')[:30]
        wars = PlayerClanWar.objects\
            .filter(player=player, clan_war__is_river_race=True)\
            .annotate(date=F('clan_war__date_start')) \
            .order_by('-date')

        result = {
            "stats": stats,
            "wars": PlayerClanWarSerializer(wars, many=True).data,
        }
        return Response(result)

    if request.method == "POST":
        pass  # TODO: handle custom periods


@api_view(['GET'])
def player_stats_per_day(request, tag):
    stat_ids = PlayerStatsHistory.objects.raw("""
        SELECT DISTINCT ON (timestamp::DATE)
            backend_playerstatshistory.id
        FROM backend_playerstatshistory
        INNER JOIN backend_player ON backend_playerstatshistory.player_id = backend_player.id
        WHERE backend_player.tag = '{0}'
        ORDER BY timestamp::DATE DESC
        LIMIT 15
    """.format(tag))

    return Response(PlayerStatsHistorySerializer(
        PlayerStatsHistory.objects.filter(id__in=[x.id for x in stat_ids]).order_by('timestamp'),
        many=True
    ).data)

