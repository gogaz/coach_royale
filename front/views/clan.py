from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from react_api.models import Clan, ClanHistory
from react_api.serializers.clan import ClanSerializer

@api_view(['GET'])
def clans_list(request):
    if request.method == 'GET':
        clans = Clan.objects.all()
        serializer = ClanSerializer(clans, many=True)
        return Response(serializer.data)


@api_view(['GET'])
def clan_infos(request, tag):
    try:
        clan = Clan.objects.get(tag=tag)
    except Clan.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    serializer = ClanSerializer(clan)
    return Response(serializer.data)
