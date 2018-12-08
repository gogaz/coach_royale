from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from react_api.models import Player, PlayerClanStatsHistory, PlayerStatsHistory, int_difference_instances
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
        data = {'count': [], 'labels': [], 'diff': []}
        now = timezone.now()
        delta = timezone.timedelta(days=1)
        player_stats = PlayerStatsHistory.objects.filter(player=player).order_by('-last_refresh')
        for day in range(30, -1, -1):
            date = now - timezone.timedelta(days=day)
            date_start = timezone.datetime(date.year, date.month, date.day, 3, 0, 0)
            date_start = timezone.make_aware(date_start)
            date_end = date_start + delta

            count = player_stats.filter(timestamp__range=(date_start, date_end)).count()
            count += player_stats.filter(timestamp__range=(date_start, date_end)).count()

            obj = player_stats.filter(timestamp__range=(date_start, date_end)).first()

            if count or obj:
                obj_next = player_stats.filter(timestamp__range=(date_end, date_end + delta)).first()
                if not obj_next:
                    if obj:
                        data['diff'].append({})
                        data['count'].append(count)
                        data['labels'].append("%02d/%02d" % (date.day, date.month))
                else:
                    data['diff'].append(int_difference_instances(obj_next, obj))
                    data['count'].append(count)
                    data['labels'].append("%02d/%02d" % (date.day, date.month))

        return Response(data)
    if request.method == "POST":
        pass  # TODO: handle custom periods
