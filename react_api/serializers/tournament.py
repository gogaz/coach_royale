from rest_framework.fields import SerializerMethodField
from rest_framework.serializers import HyperlinkedModelSerializer

from react_api.models import Tournament


class TournamentSerializer(HyperlinkedModelSerializer):
    prep_time = SerializerMethodField()
    duration = SerializerMethodField()

    class Meta:
        model = Tournament
        fields = ('tag', 'name',
                  'open', 'status',
                  'max_players', 'current_players',
                  'create_time', 'start_time', 'end_time',
                  'prep_time', 'duration')

    def get_prep_time(self, obj):
        return obj.prep_time.total_seconds()

    def get_duration(self, obj):
        return obj.duration.total_seconds()
