from rest_framework.fields import SerializerMethodField
from rest_framework.serializers import HyperlinkedModelSerializer
from react_api.models import Player, PlayerCardLevel, PlayerClanHistory, PlayerClanStatsHistory
from react_api.serializers.clan import ClanSerializer
from react_api.serializers.misc import CardSerializer


class PlayerSerializer(HyperlinkedModelSerializer):
    class Meta:
        model = Player
        # Add clan fields from ClanSerializer
        fields = ('tag', 'name', 'last_refresh')


class PlayerCardLevelSerializer(HyperlinkedModelSerializer):
    card = CardSerializer(required=False)

    class Meta:
        model = PlayerCardLevel
        fields = ('card', 'count', 'level')


class PlayerClanHistorySerializer(HyperlinkedModelSerializer):
    clan = ClanSerializer(required=False)

    class Meta:
        model = PlayerClanHistory
        fields = ('clan', 'joined_clan', 'left_clan')

