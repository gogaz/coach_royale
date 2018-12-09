from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from react_api.models import Player, PlayerClanStatsHistory, PlayerStatsHistory
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
        stats = ps.values('current_trophies', 'total_games', 'total_donations', 'timestamp')[:30]

        clan = pcs.values('current_clan_rank', 'timestamp')[:30]
        result = {
            #"stats": PlayerStatsHistorySerializer(PlayerStatsHistory.objects.filter(player=player).order_by('-id')[:30], many=True).data,
            #"clan": PlayerClanStatsSerializer(PlayerClanStatsHistory.objects.filter(player=player).order_by('-id')[:30], many=True).data,
            "stats": stats,
            "clan": clan
        }
        return Response(result)

    if request.method == "POST":
        pass  # TODO: handle custom periods
