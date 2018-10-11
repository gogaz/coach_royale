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


@api_view(['POST'])
def refresh_playable_tournaments(request):
    def raise_error(msg, status=403):
        return Response({'error': {'message': 'Your request cannot be proceeded, ' + msg}}, status=status)

    if request.method == 'POST':
        refresh = TournamentRefresh.objects.order_by('-timestamp').first()
        refresh_s = TournamentRefresh.objects.filter(success=True).order_by('-timestamp').first()
        if (refresh == refresh_s) and refresh.timestamp > timezone.now() - timezone.timedelta(minutes=15):
            return raise_error("please try again later.")
        elif refresh != refresh_s and not refresh.success and refresh.timestamp > timezone.now() - timezone.timedelta(seconds=15):
            return raise_error("another request is already pending.")
        else:
            api_client = clashroyale.RoyaleAPI(settings.ROYALE_API_KEY, timeout=10)
            result = refresh_open_tournaments(api_client)
            if not result.success:
                return raise_error(result.error, 500)
            tournaments = TournamentSerializer(TournamentRepository.get_playable_tournaments(), many=True).data
            return Response(TournamentRefreshSerializer(result, tournaments=tournaments).data)