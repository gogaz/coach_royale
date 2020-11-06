from .base import Factory
from .clashroyale import ClanFactory
from backend.lib.clan_rule_matcher.models import PlayerClanRule, PlayerClanRuleGoal


class PlayerClanRuleGoalFactory(Factory):
    @classmethod
    def create(cls, **kwargs):
        return PlayerClanRuleGoal.objects.create(
            clan=kwargs.get('clan', ClanFactory.create(**kwargs)),
            applies_to=kwargs.pop('applies_to', ['member']),
            name=kwargs.pop('name', "Some goal"),
            description=kwargs.pop('description', "Some description")
        )


class PlayerClanRuleFactory(Factory):
    @classmethod
    def create(cls, **kwargs):
        return PlayerClanRule.objects.create(**kwargs)
