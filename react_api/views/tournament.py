from django.db.models import F, DurationField, ExpressionWrapper
from django.utils import timezone
from rest_framework.decorators import api_view
from rest_framework.response import Response

from react_api.models import Tournament
from react_api.serializers.tournament import TournamentSerializer


@api_view(['GET'])
def playable_tournaments(request):
    if request.method == 'GET':
        tournaments = Tournament.objects.filter(end_time__gt=timezone.now())\
                                        .annotate(remaining=ExpressionWrapper(F('end_time') - timezone.now(),
                                                                              output_field=DurationField())) \
                                        .annotate(midtime=ExpressionWrapper(F('duration') / 2,
                                                                            output_field=DurationField())) \
                                        .filter(remaining__gte=F('midtime'),
                                                open=True,
                                                current_players__lt=F('max_players')) \
                                        .order_by('-start_time')

        return Response(TournamentSerializer(tournaments, many=True).data)
