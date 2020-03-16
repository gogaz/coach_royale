from rest_framework.serializers import HyperlinkedModelSerializer

from .models import PlayerClanRule, PlayerClanRuleGoal


class PlayerClanRuleSerializer(HyperlinkedModelSerializer):
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
        )


class PlayerClanRuleGoalSerializer(HyperlinkedModelSerializer):
    class Meta:
        model = PlayerClanRuleGoal
        fields = ('clan', 'applies_to')
