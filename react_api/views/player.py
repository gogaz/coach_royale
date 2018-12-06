from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from react_api.models import Player, PlayerClanStatsHistory, PlayerStatsHistory
from react_api.serializers.player import PlayerSerializer, PlayerClanStatsSerializer, PlayerStatsHistorySerializer


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
        data = {'count': [], 'labels': [], 'diff': []}
        now = timezone.now()
        for day in range(30, -1, -1):
            delta = timezone.timedelta(days=1)
            date = timezone.datetime(now.year, now.month, now.day, 9, 0, 0)
            date = timezone.make_aware(date - timezone.timedelta(days=day))
            date_prev = date - delta

            count = PlayerStatsHistory.objects.filter(player=player, timestamp__range=(date_prev, date)).count()
            count += PlayerClanStatsHistory.objects.filter(player=player, timestamp__range=(date_prev, date)).count()

            obj = PlayerStatsHistory.objects.filter(player=player, timestamp__range=(date_prev, date)) \
                                            .order_by('-last_refresh').first()

            if obj is not None:
                data['diff'].append(PlayerStatsHistorySerializer(obj).data)
            else:
                data['diff'].append(None)
            data['count'].append(count)

            data['labels'].append("%02d/%02d" % (date.day, date.month))

        return Response(data)
    if request.method == "POST":
        pass  # TODO: handle custom periods