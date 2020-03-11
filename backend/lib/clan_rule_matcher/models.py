from datetime import datetime

from django.db import models
from django.db.models import Q, QuerySet

from backend.models import PlayerCube, EditableModel


class PlayerClanRuleGoal(EditableModel):
    PLAYER_ROLE_CHOICES = [('member', 'Member'), ('elder', 'Elder'), ('coLeader', 'Co-Leader')]

    clan = models.ForeignKey('backend.Clan', on_delete=models.CASCADE)
    applies_to = models.CharField(max_length=16, choices=PLAYER_ROLE_CHOICES)

    def execute_on(self, query: QuerySet, clan=None):
        PlayerCube.refresh_view()
        query = query.filter(clan=clan or self.clan, clan_role=self.applies_to)
        return {rule: rule.execute_on(query) for rule in self.playerclanrule_set.all()}


class PlayerClanRule(EditableModel):
    VALUE_TYPE_AVAILABLE_CLASSES = {'int': int, 'str': str, 'date': datetime}
    VALUE_TYPE_CHOICES = [(t, t) for t in VALUE_TYPE_AVAILABLE_CLASSES]
    OPERATOR_AVAILABLE_FILTERS = {'>': 'gte', '<': 'lte', 'between': 'range'}
    OPERATOR_CHOICES = [
        ('>', 'is greater than'),
        ('<', 'is less than'),
        ('between', 'is between'),
        ('not_between', 'is not between')
    ]

    goal = models.ForeignKey(PlayerClanRuleGoal, on_delete=models.CASCADE)
    field = models.CharField(max_length=128)
    operator = models.CharField(max_length=32, choices=OPERATOR_CHOICES)
    value = models.CharField(max_length=255, null=True)
    value_bound = models.CharField(max_length=255, null=True)
    value_type = models.CharField(max_length=255, choices=VALUE_TYPE_CHOICES, default='int')
    # A predicate helps to enable or disable a rule according to another, works by filtering players that
    # matches the predicate
    predicate = models.ForeignKey('PlayerClanRule', null=True, on_delete=models.SET_NULL)
    is_promoting_rule = models.BooleanField(default=True)

    def _execute_not_between(self, query, compare_value):
        args = {self.field + '__range': compare_value}
        return query.filter(~Q(**args))

    def execute_on(self, query: QuerySet):
        """
        Execute a rule on a set of player cubes
        :param query: QuerySet[PlayerCube] a list of player cubes to apply rule on
        :return: QuerySet
        """
        if self.predicate is not None:
            query = self.predicate.execute_on(query)

        klass = self.VALUE_TYPE_AVAILABLE_CLASSES[self.value_type]
        value = klass(self.value) if self.value else klass()
        value_bound = klass(self.value_bound) if self.value_bound else klass()
        compare_value = [value, value_bound] if self.operator == 'between' else value

        if self.operator == 'not_between':
            return self._execute_not_between(query, compare_value)

        return query.filter(**{self.field + '__' + self.OPERATOR_AVAILABLE_FILTERS[self.operator]: compare_value})
