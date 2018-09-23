from rest_framework.fields import SerializerMethodField
from rest_framework.serializers import HyperlinkedModelSerializer

from react_api.models import Player, PlayerCardLevel, PlayerClanHistory, PlayerStatsHistory, PlayerClanStatsHistory
from react_api.repository import PlayerRepository
from react_api.serializers.clan import ClanFullSerializer
from react_api.serializers.misc import CardSerializer


class PlayerStatsSerializer(HyperlinkedModelSerializer):
    class Meta:
        model = PlayerStatsHistory
        fields = ('timestamp', 'last_refresh',
                  'level',
                  'total_donations',
                  'highest_trophies', 'current_trophies',
                  'challenge_cards_won', 'tourney_cards_won', 'cards_found',
                  'favorite_card', 'arena',
                  'total_games', 'tournament_games',
                  'wins', 'losses', 'draws', 'win_3_crowns',
                  'clan_cards_collected', 'war_day_wins')


class PlayerClanStatsSerializer(HyperlinkedModelSerializer):
    class Meta:
        model = PlayerClanStatsHistory
        fields = ('timestamp', 'last_refresh',
                  'clan_role', 'current_clan_rank',
                  'donations', 'donations_received')


class PlayerSerializer(HyperlinkedModelSerializer):
    details = SerializerMethodField()
    clan = SerializerMethodField()

    def get_details(self, obj):
        return PlayerStatsSerializer(PlayerStatsHistory.objects.filter(player=obj).order_by('-timestamp').first()).data

    def get_clan(self, obj):
        return ClanFullSerializer(PlayerRepository.get_clan_for_player(obj)).data

    class Meta:
        model = Player
        fields = ('tag', 'name', 'clan', 'details')


class PlayerCardLevelSerializer(HyperlinkedModelSerializer):
    card = CardSerializer(required=False)

    class Meta:
        model = PlayerCardLevel
        fields = ('card', 'count', 'level')


class PlayerClanSerializer(HyperlinkedModelSerializer):
    clan = ClanFullSerializer(required=False)

    class Meta:
        model = PlayerClanHistory
        fields = ('clan', 'joined_clan', 'left_clan')
