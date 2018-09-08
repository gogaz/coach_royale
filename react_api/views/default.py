from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(['GET'])
def home(request):
    if request.method == 'GET':
        return Response({"url": "/clan/" + settings.MAIN_CLAN})
