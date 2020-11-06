from rest_framework.serializers import ModelSerializer
from rest_framework.fields import SerializerMethodField

from .models import PlayerClanRule, PlayerClanRuleGoal


class PlayerClanRuleSerializer(ModelSerializer):
    description = SerializerMethodField()
    filtered_column_type = SerializerMethodField()

    def get_description(self, obj):
        return obj.humanize()

    def get_filtered_column_type(self, obj):
        return obj.filtered_column_type

    class Meta:
        model = PlayerClanRule
        fields = (
            'goal',
            'field',
            'operator',
            'value',
            'value_bound',
            'value_type',
            'predicate',
            'is_promoting_rule',
            'description',
            'filtered_column_type',
        )


class PlayerClanRuleGoalSerializer(ModelSerializer):
    class Meta:
        model = PlayerClanRuleGoal
        fields = ('id', 'name', 'description', 'applies_to')
