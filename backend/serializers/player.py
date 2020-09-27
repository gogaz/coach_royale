from rest_framework.fields import SerializerMethodField
from rest_framework.serializers import HyperlinkedModelSerializer

from backend.models import (
    Arena,
    Player,
    PlayerCardLevel,
    PlayerClanHistory,
    PlayerStatsHistory,
    PlayerClanStatsHistory,
    PlayerClanWar,
)
from backend.serializers.clan import ClanWithDetailsSerializer, ClanWarSerializer
from backend.serializers.misc import CardSerializer


class PlayerStatsSerializer(HyperlinkedModelSerializer):
    highest_arena = SerializerMethodField()

    def get_highest_arena(self, obj: PlayerStatsHistory):
        arena = Arena.from_trophies(obj.highest_trophies)
        return None if arena is None else arena.arena

    class Meta:
        model = PlayerStatsHistory
        fields = (
            'timestamp', 'last_refresh',
            'level',
            'total_donations',
            'highest_trophies', 'highest_arena',
            'current_trophies', 'arena',
            'challenge_cards_won', 'tourney_cards_won', 'cards_found',
            'favorite_card',
            'total_games', 'tournament_games',
            'wins', 'losses', 'draws', 'win_3_crowns',
            'clan_cards_collected', 'war_day_wins',
        )


class PlayerClanStatsSerializer(HyperlinkedModelSerializer):
    clan = SerializerMethodField()
    dates_in_clan = SerializerMethodField()

    def get_dates_in_clan(self, obj: PlayerClanStatsHistory):
        return PlayerClanHistory.objects.filter(
            player=obj.player,
            clan=obj.clan
        ).order_by('-id').values('joined_clan', 'left_clan').first()

    def get_clan(self, obj: PlayerClanStatsHistory):
        return ClanWithDetailsSerializer(obj.clan).data

    class Meta:
        model = PlayerClanStatsHistory
        fields = ('clan', 'timestamp', 'last_refresh',
                  'clan_role', 'current_clan_rank',
                  'donations', 'donations_received', 'dates_in_clan', 'last_seen')


class PlayerStatsHistorySerializer(HyperlinkedModelSerializer):
    highest_arena = SerializerMethodField()

    def get_highest_arena(self, obj: PlayerStatsHistory):
        return Arena.from_trophies(obj.highest_trophies)

    class Meta:
        model = PlayerStatsHistory
        fields = ('timestamp', 'last_refresh',
                  'level',
                  'total_donations',
                  'highest_trophies', 'highest_arena',
                  'current_trophies', 'arena',
                  'challenge_cards_won', 'tourney_cards_won',
                  'cards_found', 'favorite_card',
                  'total_games', 'tournament_games',
                  'wins', 'losses', 'draws', 'win_3_crowns',
                  'clan_cards_collected', 'war_day_wins')


class PlayerSerializer(HyperlinkedModelSerializer):
    details = SerializerMethodField()
    clan = SerializerMethodField()

    def get_details(self, obj):
        return PlayerStatsSerializer(PlayerStatsHistory.objects.filter(player=obj).order_by('-id').first()).data

    def get_clan(self, obj):
        return PlayerClanStatsSerializer(
            PlayerClanStatsHistory.objects.filter(player=obj).order_by('-last_refresh').first()
        ).data

    class Meta:
        model = Player
        fields = ('tag', 'name', 'clan', 'details')


class PlayerCardLevelSerializer(HyperlinkedModelSerializer):
    card = CardSerializer(required=False)

    class Meta:
        model = PlayerCardLevel
        fields = ('card', 'count', 'level')


class PlayerClanSerializer(HyperlinkedModelSerializer):
    clan = ClanWithDetailsSerializer(required=False)

    class Meta:
        model = PlayerClanHistory
        fields = ('clan', 'joined_clan', 'left_clan')


class PlayerClanWarSerializer(HyperlinkedModelSerializer):
    clan_war = ClanWarSerializer(required=False)

    class Meta:
        model = PlayerClanWar
        fields = (
            'clan_war',
            'final_battles',
            'final_battles_done',
            'final_battles_wins',
            'final_battles_misses',
            'crowns',
            'collections_cards_earned',
            'collections_battles',
            'collections_battles_done',
            'collections_battles_wins',
            'fame',
            'repair_points',
        )
