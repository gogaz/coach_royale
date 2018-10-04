from rest_framework.fields import SerializerMethodField
from rest_framework.serializers import HyperlinkedModelSerializer

from react_api.models import Clan, ClanHistory, PlayerClanStatsHistory, Player, ClanWar


class ClanDetailsSerializer(HyperlinkedModelSerializer):
    class Meta:
        model = ClanHistory
        fields = ('timestamp', 'last_refresh',
                  'score', 'trophies',
                  'member_count',
                  'donations',
                  'region',
                  'badge', 'description')


class ClanSerializer(HyperlinkedModelSerializer):
    class Meta:
        model = Clan
        fields = ('tag', 'name', 'last_refresh')


class PlayerClanStatsSerializer(HyperlinkedModelSerializer):
    class Meta:
        model = PlayerClanStatsHistory
        fields = ('last_refresh',
                  'clan_role', 'current_clan_rank', 'previous_clan_rank',
                  'donations', 'donations_received',
                  'level', 'trophies', 'arena')


class PlayerClanDetailsSerializer(HyperlinkedModelSerializer):
    details = SerializerMethodField()

    def get_details(self, obj):
        return {} if not obj.last_stat_list else PlayerClanStatsSerializer(obj.last_stat_list[-1]).data

    class Meta:
        model = Player
        fields = ('tag', 'name', 'last_refresh', 'details')


class ClanWarSerializer(HyperlinkedModelSerializer):
    class Meta:
        model = ClanWar
        fields = (
            'date_start', 'date_end',
            'participants',
            'final_battles',
            'collections_battles', 'collections_cards',
            'wins', 'losses', 'crowns',
            'final_position',
            'trophies', 'total_trophies', 'season',
        )


class ClanWithDetailsSerializer(HyperlinkedModelSerializer):
    details = SerializerMethodField()
    war = SerializerMethodField()

    def get_details(self, obj):
        return ClanDetailsSerializer(ClanHistory.objects.filter(clan=obj).order_by('-timestamp').first()).data

    def get_war(self, obj):
        return ClanWarSerializer(ClanWar.objects.filter(clan=obj).order_by('-date_start').first()).data

    class Meta:
        model = Clan
        fields = ('tag', 'name', 'details', 'war')
