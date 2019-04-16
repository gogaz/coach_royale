from django.db.models import Sum, F, Value
from django.db.models.functions import Greatest
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from react_api.models import Player, PlayerClanStatsHistory, PlayerStatsHistory, PlayerClanWar
from react_api.serializers.player import PlayerSerializer, PlayerClanStatsSerializer


@api_view(['GET'])
def player_info(request, tag):
    try:
        player = Player.objects.get(tag=tag)
    except Player.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(PlayerSerializer(player).data)


@api_view(['GET'])
def player_clan(request, tag):
    try:
        player = Player.objects.get(tag=tag)
    except Player.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        stats = PlayerClanStatsHistory.objects.filter(player=player).order_by('-last_refresh').first()
        return Response(PlayerClanStatsSerializer(stats).data)


@api_view(["GET", "POST"])
def player_activity(request, tag):
    try:
        player = Player.objects.get(tag=tag)
    except Player.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        ps = PlayerStatsHistory.objects.filter(player=player).order_by('-id')
        pcs = PlayerClanStatsHistory.objects.filter(player=player).order_by('-id')

        stats = ps.values('current_trophies', 'total_games', 'total_donations', 'timestamp', 'wins', 'losses', 'draws')[:30]
        clan = pcs.values('current_clan_rank', 'timestamp')[:30]
        wars = PlayerClanWar.objects.filter(player=player)\
                            .aggregate(wins=Sum('final_battles_wins'),
                                       availables=Sum(Greatest(F('final_battles_done'), Value(1))),
                                       battles=Sum('final_battles_done'))

        result = {
            "stats": stats,
            "clan": clan,
            "wars": wars,
        }
        return Response(result)

    if request.method == "POST":
        pass  # TODO: handle custom periods
