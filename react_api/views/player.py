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
        for day in range(30, -1, -1):  # FIXME: not longer than the latest clan join (we have no data before that)
            delta = timezone.timedelta(days=1)
            date = timezone.datetime(now.year, now.month, now.day, 9, 0, 0)
            date = timezone.make_aware(date - timezone.timedelta(days=day))
            date_prev = date - delta

            count = PlayerStatsHistory.objects.filter(player=player, timestamp__range=(date_prev, date)).count()
            count += PlayerClanStatsHistory.objects.filter(player=player, timestamp__range=(date_prev, date)).count()

            obj = PlayerStatsHistory.objects.filter(player=player, timestamp__range=(date_prev, date)) \
                                            .order_by('-last_refresh').first()

            obj_prev = PlayerStatsHistory.objects.filter(player=player, timestamp__range=(date_prev - delta, date - delta)) \
                                                 .order_by('-last_refresh').first()

            if obj is not None:
                diff = int_difference_instances(obj, obj_prev, ['id'])
                data['diff'].append(diff)
            else:
                data['diff'].append({})
            data['count'].append(count)

            data['labels'].append("%02d/%02d" % (date.day, date.month))

        return Response(data)
    if request.method == "POST":
        pass  # TODO: handle custom periods