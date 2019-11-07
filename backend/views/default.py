from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response

from backend.models import Clan
from backend.serializers.clan import ClanSerializer


@api_view(['GET'])
def home(request):
    if request.method == 'GET':
        clan = Clan.objects.filter(tag=settings.MAIN_CLAN).first()
        return Response({"url": "/clan/" + settings.MAIN_CLAN,
                         'main_clan': ClanSerializer(clan).data if clan else {}})
