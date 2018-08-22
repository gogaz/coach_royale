from rest_framework.serializers import HyperlinkedModelSerializer

from react_api.models import Arena, Card


class ArenaSerializer(HyperlinkedModelSerializer):
    class Meta:
        model = Arena
        fields = ('tag', 'name', 'icon', 'number')


class CardSerializer(HyperlinkedModelSerializer):
    class Meta:
        model = Card
        fields = ('key', 'name', 'rarity', 'arena', 'elixir', 'type', 'image')


