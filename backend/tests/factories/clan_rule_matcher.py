from .base import Factory
from .clashroyale import ClanFactory
from backend.lib.clan_rule_matcher.models import PlayerClanRule, PlayerClanRuleGoal


class PlayerClanRuleGoalFactory(Factory):
    @classmethod
    def create(cls, **kwargs):
        goal = PlayerClanRuleGoal(
            clan=kwargs.get('clan', ClanFactory.create(**kwargs)),
            applies_to=kwargs.pop('applies_to', 'member')
        )
        goal.save()
        return goal


class PlayerClanRuleFactory(Factory):
    @classmethod
    def create(cls, **kwargs):
        rule = PlayerClanRule(
            goal=kwargs.pop('goal', PlayerClanRuleGoalFactory.create(**kwargs)),
            field=kwargs.pop('field', 'trophies'),
            operator=kwargs.pop('operator', '>'),
            value=kwargs.pop('value', '4000'),
            value_bound=kwargs.pop('value_bound', None),
            value_type=kwargs.pop('value_type', 'int'),
            predicate=kwargs.pop('predicate', None),
            is_promoting_rule=kwargs.pop('is_promoting_rule', True),
        )
        rule.save()
        return rule
