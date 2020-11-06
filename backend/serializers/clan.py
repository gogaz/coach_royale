from rest_framework.fields import SerializerMethodField
from rest_framework.serializers import HyperlinkedModelSerializer

from backend.models import Clan, ClanHistory, PlayerClanStatsHistory, Player, ClanWar, PlayerClanWar, PlayerSeason, Arena


class ClanDetailsSerializer(HyperlinkedModelSerializer):
    class Meta:
        model = ClanHistory
        fields = ('timestamp', 'last_refresh',
                  'score', 'trophies', 'clan_war_trophies',
                  'member_count',
                  'donations',
                  'region', 'region_code',
                  'badge', 'description',
                  'prev_local_rank', 'local_rank',
                  'prev_global_rank', 'global_rank',
                  'prev_global_war_rank', 'global_war_rank',
                  'prev_local_war_rank', 'local_war_rank'
                  )


class ClanSerializer(HyperlinkedModelSerializer):
    class Meta:
        model = Clan
        fields = ('tag', 'name', 'last_refresh')


class PlayerClanStatsSerializer(HyperlinkedModelSerializer):
    class Meta:
        model = PlayerClanStatsHistory
        fields = (
            'last_refresh',
            'clan_role', 'current_clan_rank',
            'donations', 'donations_received',
            'level', 'trophies', 'arena', 'last_seen'
        )


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
            'id',
            'date_start',
            'date_end',
            'participants',
            'final_position',
            'trophies',
            'total_trophies',
            'season',
            'fame',
            'repair_points',
            'finish_time',
        )


class PlayerClanWarSerializer(HyperlinkedModelSerializer):
    class Meta:
        model = PlayerClanWar
        fields = (
            'clan_war_id',
            'fame',
            'repair_points',
        )


class PlayerInClanWarSerializer(HyperlinkedModelSerializer):
    wars = SerializerMethodField()
    details = SerializerMethodField()

    def __init__(self, *args, **kwargs):
        self.wars_list = kwargs.pop('wars' or [])
        super().__init__(*args, **kwargs)

    def get_details(self, obj):
        return PlayerClanStatsSerializer(PlayerClanStatsHistory.objects.filter(player=obj).order_by('-id').first()).data

    def get_wars(self, obj):
        query = PlayerClanWar.objects.filter(player=obj, clan_war__in=self.wars_list).order_by('-id')[:10]
        return PlayerClanWarSerializer(query, many=True).data

    class Meta:
        model = Player
        fields = ('tag', 'name', 'details', 'wars')


class PlayerWeeklyDonationsSerializer(HyperlinkedModelSerializer):
    details = SerializerMethodField()

    def get_details(self, obj):
        values = ('timestamp', 'donations', 'donations_received', 'trophies', 'arena', 'level')
        fallback = {v: None for v in ClanDetailsSerializer.Meta.fields}
        return PlayerClanStatsHistory.objects.filter(player=obj, timestamp__lte=obj.date) \
                                     .order_by('-id') \
                                     .values(*values) \
                                     .first() or fallback

    class Meta:
        model = Player
        fields = ('tag', 'name', 'details')


class PlayerClanSeasonSerializer(HyperlinkedModelSerializer):
    details = SerializerMethodField()

    def get_details(self, obj):
        value_keys = ('ending', 'highest', 'season__identifier')
        fallback = {v: None for v in value_keys}

        values = PlayerSeason.objects.filter(player=obj, season__id=obj.season_id).values(*value_keys).first()
        values_with_fallback = fallback if values is None else values

        ending_arena = Arena.from_trophies(values_with_fallback['ending'])
        highest_arena = Arena.from_trophies(values_with_fallback['highest'])

        return {
            **values_with_fallback,
            'ending_arena': ending_arena.arena if ending_arena else None,
            'highest_arena': highest_arena.arena if ending_arena else None,
        }

    class Meta:
        model = Player
        fields = ('tag', 'name', 'details')


class ClanWithDetailsSerializer(HyperlinkedModelSerializer):
    details = SerializerMethodField()
    war = SerializerMethodField()

    def get_details(self, obj):
        fallback = {v: None for v in ClanDetailsSerializer.Meta.fields}
        return ClanDetailsSerializer(ClanHistory.objects.filter(clan=obj).order_by('-id').first()).data or fallback

    def get_war(self, obj):
        return ClanWarSerializer(ClanWar.objects.filter(clan=obj).order_by('-date_start').first()).data

    class Meta:
        model = Clan
        fields = ('tag', 'name', 'details', 'war')
