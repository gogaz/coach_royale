from django.db.models import Sum, F, Value
from django.db.models.functions import Greatest
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from backend.models import Player, PlayerStatsHistory, PlayerClanWar
from backend.serializers.player import PlayerSerializer, PlayerClanWarSerializer


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
