from rest_framework.fields import SerializerMethodField
from rest_framework.relations import PrimaryKeyRelatedField
from rest_framework.serializers import HyperlinkedModelSerializer

from react_api.models import Clan, PlayerClanHistory, ClanHistory


class ClanDetailsSerializer(HyperlinkedModelSerializer):
    class Meta:
        model = ClanHistory
        fields = ('timestamp', 'last_refresh',
                  'score', 'trophies',
                  'member_count',
                  'donations',
                  'region',
                  'badge')


class ClanSerializer(HyperlinkedModelSerializer):
    details = SerializerMethodField()

    def get_details(self, obj):
        return ClanDetailsSerializer(ClanHistory.objects.filter(clan=obj).order_by('-timestamp').first()).data

    class Meta:
        model = Clan
        fields = ('details', 'tag', 'name', 'last_refresh')
