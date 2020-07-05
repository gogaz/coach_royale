from django.forms import Form
from rest_framework.response import Response
from rest_framework.serializers import HyperlinkedModelSerializer

from backend.models import Arena, Card


def raise_error(message, status=500):
    return Response({'error': {'message': message}}, status=status)


def refresh_error(message, status=403):
    return raise_error('Your request cannot be proceeded, ' + message, status=status)


def not_found_error(object, id, status=404):
    return raise_error("%s %s was not found." % (object.title(), id), status=status)


def form_error(form: Form, status=403):
    return Response({
        'success': False,
        'errors': dict(form.errors.items()),
    }, status=status)


class ArenaSerializer(HyperlinkedModelSerializer):
    class Meta:
        model = Arena
        fields = ('key', 'name', 'arena', 'min_trophy_limit', 'max_trophy_limit')


class CardSerializer(HyperlinkedModelSerializer):
    class Meta:
        model = Card
        fields = ('key', 'name', 'rarity', 'arena', 'elixir', 'type', 'image')
