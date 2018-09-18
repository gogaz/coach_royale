from rest_framework.serializers import HyperlinkedModelSerializer

from react_api.models import Tournament


class TournamentSerializer(HyperlinkedModelSerializer):
    class Meta:
        model = Tournament
        fields = ('tag', 'name',
                  'open', 'status',
                  'max_players', 'current_players',
                  'create_time', 'start_time', 'end_time',
                  'prep_time', 'duration')
