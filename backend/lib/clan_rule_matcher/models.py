import re

from django.db import models
from django.db.models import QuerySet, Q
from django.utils import timezone
from django.contrib.postgres.fields import ArrayField
from dateutil.parser import parse as parse_date

from backend.models import PlayerCube, EditableModel

INTERVAL_REGEXP = re.compile(r'^((?P<days>-?\d+) days?)?(\s*,?\s*(?P<hours>\d+?):(?P<minutes>\d+?):(?P<seconds>\d+?))?$')


def parse_interval(string):
    match = INTERVAL_REGEXP.match(str(string))
    if not match:
        return timezone.timedelta()
    return timezone.timedelta(**{k: int(v) for k, v in match.groupdict().items() if v is not None})


class PlayerClanRuleGoal(EditableModel):
    """
    Example Usage:
    goal = PlayerClanRuleGoal(clan=clan, name="Low trophies", applies_to=['elder', 'member', 'coLeader'])
    """
    PLAYER_ROLE_CHOICES = [('member', 'Member'), ('elder', 'Elder'), ('coLeader', 'Co-Leader')]

    clan = models.ForeignKey('backend.Clan', on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    description = models.TextField(null=True)
    applies_to = ArrayField(models.CharField(max_length=16, choices=PLAYER_ROLE_CHOICES))

    def save(self, *args, **kwargs):
        self.applies_to = list(set(self.applies_to))
        super(PlayerClanRuleGoal, self).save(*args, **kwargs)

    def execute_on(self, query: QuerySet):
        return query.filter(Q(clan=self.clan) & self.as_filters())

    def as_filters(self):
        goal_filters = Q()
        for rule in self.get_rules():
            goal_filters |= rule.as_filters()
        return goal_filters & Q(clan_role__in=self.applies_to)

    def get_rules(self):
        return self.playerclanrule_set.all().order_by('id')


class PlayerClanRule(EditableModel):
    """
    Example usage:
    rule1 = PlayerClanRule(goal=goal, field='trophies', operator='<', value=5000, is_promoting_rule=False)
    rule2 = PlayerClanRule(field='last_seen', operator='<', value='-14 days', is_promoting_rule=False)
    rule3 = PlayerClanRule(field='last_seen', operator='<', value='-14 days', is_promoting_rule=False)
    """
    VALUE_TYPE_HANDLERS = {
        'int': lambda x: int(x) if x else 0,
        'str': lambda x: x if x else '',
        'date': lambda x: parse_date(x) if x else timezone.now(),
        'interval': lambda x: timezone.now() + parse_interval(x),
    }
    VALUE_TYPE_CHOICES = [(t, t) for t in VALUE_TYPE_HANDLERS.keys()]
    OPERATOR_AVAILABLE_FILTERS = {'>': 'gte', '<': 'lte', '=': None, 'between': 'range'}
    OPERATOR_CHOICES = {
        '>': 'is greater than',
        '<': 'is less than',
        '=': 'is exactly',
        'between': 'is between',
    }
    FILTERABLE_FIELDS = {'CharField': str, 'IntegerField': int, 'DateTimeField': timezone.datetime}

    goal = models.ForeignKey(PlayerClanRuleGoal, null=True, on_delete=models.CASCADE)
    field = models.CharField(max_length=128)
    operator = models.CharField(max_length=32, choices=list(OPERATOR_CHOICES.items()))
    value = models.CharField(max_length=255, null=True)
    value_bound = models.CharField(max_length=255, null=True)
    value_type = models.CharField(max_length=255, choices=VALUE_TYPE_CHOICES, default='int')
    # A predicate helps to enable or disable a rule according to another, works by filtering players that
    # matches the predicate
    predicate = models.ForeignKey('PlayerClanRule', null=True, on_delete=models.SET_NULL)
    is_promoting_rule = models.BooleanField(default=True)

    @classmethod
    def get_filterable_fields(cls):
        return list(filter(lambda x: x.get_internal_type() in cls.FILTERABLE_FIELDS.keys(), PlayerCube._meta.fields))

    def __str__(self):
        return "{0.field} {0.operator} {0.humanized_value}".format(self)

    @property
    def humanized_value(self):
        if self.value_type == 'interval':
            val = self.value[1:] + ' ago' if self.value.startswith('-') else self.value + ' from now'
            if self.value_bound is not None:
                val_bound = self.value_bound[1:] + ' ago' if self.value_bound.startswith('-') else 'in ' + self.value_bound
            else:
                val_bound = None
            values = [val, val_bound]
        else:
            values = [self.value, self.value_bound]
        return ' and '.join([v for v in values if v is not None])

    @property
    def filtered_column(self):
        try:
            filterable_fields = self.get_filterable_fields()
            return [f for f in filterable_fields if f.name == self.field][0]
        except IndexError:
            raise ValueError('Filtered column must be ' + ' or '.join(self.FILTERABLE_FIELDS.keys()))

    @property
    def filtered_column_type(self):
        return self.FILTERABLE_FIELDS[self.filtered_column.get_internal_type()].__name__

    # @override
    def save(self, *args, **kwargs):
        self._sanitize_value()
        self._sanitize_value_bound()
        super(PlayerClanRule, self).save(*args, **kwargs)

    def _sanitize_value(self):
        if isinstance(self.value, timezone.timedelta) or isinstance(self.value, int):
            self.value = str(self.value)
        if isinstance(self.value, timezone.datetime):
            self.value = self.value.strftime('%Y-%m-%d %H:%M:%S')

    def _sanitize_value_bound(self):
        if isinstance(self.value_bound, timezone.timedelta) or isinstance(self.value_bound, int):
            self.value = str(self.value)
        if isinstance(self.value_bound, timezone.datetime):
            self.value = self.value_bound.strftime('%Y-%m-%d %H:%M:%S')

    def _get_main_filter(self):
        main_filter = self.OPERATOR_AVAILABLE_FILTERS[self.operator]
        return self.field if main_filter is None else '{}__{}'.format(self.field, main_filter)

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

        filters = Q(**{self._get_main_filter(): value})
        if self.value_type == 'date' or self.value_type == 'interval':
            filters = filters | Q(**{'%s__isnull' % self.field: True})
        if self.predicate:
            filters = filters & self.predicate.as_filters()
        return filters

    def execute_on(self, query: QuerySet):
        """
        Execute a rule on a set of player cubes
        :param QuerySet[PlayerCube] query: a list of player cubes to apply rule on
        :return: QuerySet
        """
        if self.predicate is not None:
            query = query.filter(self.predicate.as_filters())
        return query.filter(self.as_filters())

    def get_filtered_users(self, query: QuerySet):
        """
        Returns the players which are not returned by execute_on
        :param QuerySet[PlayerCube] query: a list of player cubes to apply the invert of the rule on
        :return: QuerySet
        """
        return query.filter(~self.as_filters())

    def humanize(self):
        return "{} {} {}".format(
            self.field.replace('_', ' '),
            self.OPERATOR_CHOICES[self.operator],
            self.humanized_value
        )
