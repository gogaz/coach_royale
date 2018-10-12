from rest_framework.response import Response
from rest_framework.serializers import HyperlinkedModelSerializer

from react_api.models import Arena, Card


def raise_error(message, status=500):
    return Response({'error': {'message': message}}, status=status)


def refresh_error(message, status=403):
    return raise_error('Your request cannot be proceeded, ' + message, status=status)


def not_found_error(object, id, status=404):
    return raise_error("%s %s was not found." % (object.title(), id), status=status)


class ArenaSerializer(HyperlinkedModelSerializer):
    class Meta:
        model = Arena
        fields = ('tag', 'name', 'icon', 'number')


class CardSerializer(HyperlinkedModelSerializer):
    class Meta:
        model = Card
        fields = ('key', 'name', 'rarity', 'arena', 'elixir', 'type', 'image')


