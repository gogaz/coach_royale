from django.db.models import F
from django.utils import timezone
from rest_framework.decorators import api_view
from rest_framework.response import Response

from react_api.models import Tournament
from react_api.serializers.tournament import TournamentSerializer


@api_view(['GET'])
def joinable_tournaments(request):
    if request.method == 'GET':
        tournaments = Tournament.objects.filter(open=True,
                                                current_players__lt=F('max_players'),
                                                end_time__gt=timezone.now()) \
                                        .order_by('-start_time')

        return Response(TournamentSerializer(tournaments, many=True, context={'request': request}).data)
