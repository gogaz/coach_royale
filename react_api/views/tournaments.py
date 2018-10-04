import clashroyale
from django.conf import settings
from django.utils import timezone
from rest_framework.decorators import api_view
from rest_framework.response import Response

from react_api.helpers.api.tournament import refresh_open_tournaments
from react_api.models import TournamentRefresh
from react_api.repository import TournamentRepository
from react_api.serializers.tournaments import TournamentSerializer, TournamentRefreshSerializer


@api_view(['GET'])
def playable_tournaments(request):
    if request.method == 'GET':
        tournaments = TournamentSerializer(TournamentRepository.get_playable_tournaments(), many=True).data
        refresh = TournamentRefresh.objects.filter(success=True).order_by('-timestamp').first()
        j = TournamentRefreshSerializer(refresh, tournaments=tournaments)
        return Response(j.data)
