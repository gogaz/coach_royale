import re

from django.db import models
from django.db.models import QuerySet, Q
from django.utils import timezone
from dateutil.parser import parse as parse_date

from backend.models import PlayerCube, EditableModel

INTERVAL_REGEXP = re.compile(r'^((?P<days>-?\d+) days?, )?(?P<hours>\d+?):(?P<minutes>\d+?):(?P<seconds>\d+?)$')


def parse_interval(string):
    match = INTERVAL_REGEXP.match(str(string))
    if not match:
        return timezone.timedelta()
    return timezone.timedelta(**{k: int(v) for k, v in match.groupdict().items() if v is not None})


class PlayerClanRuleGoal(EditableModel):
    PLAYER_ROLE_CHOICES = [('member', 'Member'), ('elder', 'Elder'), ('coLeader', 'Co-Leader')]

    clan = models.ForeignKey('backend.Clan', on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    description = models.TextField(null=True)
    applies_to = models.CharField(max_length=16, choices=PLAYER_ROLE_CHOICES)

    def execute_on(self, query: QuerySet, clan=None):
        PlayerCube.refresh_view()
        query = query.filter(clan=clan or self.clan, clan_role=self.applies_to)
        return {rule: rule.execute_on(query) for rule in self.playerclanrule_set.all()}


class PlayerClanRule(EditableModel):
    VALUE_TYPE_HANDLERS = {
        'int': lambda x: int(x) if x else 0,
        'str': lambda x: x if x else '',
        'date': lambda x: parse_date(x) if x else timezone.now(),
        'interval': lambda x: timezone.now() + parse_interval(x),
    }
    VALUE_TYPE_CHOICES = [(t, t) for t in VALUE_TYPE_HANDLERS.keys()]
    OPERATOR_AVAILABLE_FILTERS = {'>': 'gte', '<': 'lte', 'between': 'range'}
    OPERATOR_CHOICES = [
        ('>', 'is greater than'),
        ('<', 'is less than'),
        ('between', 'is between'),
    ]

    goal = models.ForeignKey(PlayerClanRuleGoal, null=True, on_delete=models.CASCADE)
    field = models.CharField(max_length=128)
    operator = models.CharField(max_length=32, choices=OPERATOR_CHOICES)
    value = models.CharField(max_length=255, null=True)
    value_bound = models.CharField(max_length=255, null=True)
    value_type = models.CharField(max_length=255, choices=VALUE_TYPE_CHOICES, default='int')
    # A predicate helps to enable or disable a rule according to another, works by filtering players that
    # matches the predicate
    predicate = models.ForeignKey('PlayerClanRule', null=True, on_delete=models.SET_NULL)
    is_promoting_rule = models.BooleanField(default=True)

    def get_main_filter(self):
        return '{}__{}'.format(self.field, self.OPERATOR_AVAILABLE_FILTERS[self.operator])

    def as_filters(self):
        """
        Returns the rules to be used by the QuerySet API
        :return: Q
        """
        handler = self.VALUE_TYPE_HANDLERS[self.value_type]
        value = handler(self.value)
        bound = handler(self.value_bound)

        if self.operator == 'between':
            return Q(**{'%s__gte' % self.field: value}) & Q(**{'%s__lte' % self.field: bound})

        filters = Q(**{self.get_main_filter(): value})
        if self.value_type == 'date' or self.value_type == 'interval':
            filters = filters | Q(**{'%s__isnull' % self.field: True})
        return filters

    def execute_on(self, query: QuerySet):
        """
        Execute a rule on a set of player cubes
        :param QuerySet[PlayerCube] query: a list of player cubes to apply rule on
        :return: QuerySet
        """
        if self.predicate is not None:
            query = self.predicate.execute_on(query)
        return query.filter(self.as_filters())

    def get_filtered_users(self, query: QuerySet):
        """
        Returns the players which are not returned by execute_on
        :param QuerySet[PlayerCube] query: a list of player cubes to apply the invert of the rule on
        :return: QuerySet
        """
        return query.filter(~self.as_filters())
