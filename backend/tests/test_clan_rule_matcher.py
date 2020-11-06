from django.db.models import Q, QuerySet
from django.test import TestCase
from django.utils import timezone

from backend.lib.clan_rule_matcher.models import PlayerCube, PlayerClanRule, parse_interval

from .factories.clan_rule_matcher import PlayerClanRuleGoalFactory, PlayerClanRuleFactory
from .factories.clashroyale import ClanFactory, PlayerFactory


class ClanRuleMatcherTestCase(TestCase):
    def setUp(self):
        self.clan = ClanFactory.create(with_history=True, name="Gang of Musketeers", tag="AAA")
        self.good_player = PlayerFactory.create(with_history=True, with_clan=True, clan=self.clan, clan_role='leader')
        self.medium_player = PlayerFactory.create(
            with_history=True,
            with_clan=True,
            clan=self.clan,
            clan_rank=20,
            level=12,
            clan_role='elder',
        )
        self.bad_player = PlayerFactory.create(
            with_history=True,
            with_clan=True,
            clan=self.clan,
            level=10,
            current_trophies=3000,
            joined_clan=timezone.now() - timezone.timedelta(weeks=52)
        )
        self.new_player = PlayerFactory.create(
            with_history=True,
            with_clan=True,
            clan=self.clan,
            level=10,
            current_trophies=2999,
            joined_clan=timezone.now() - timezone.timedelta(days=5)
        )
        # Red herring
        self.irrelevant_player = PlayerFactory.create(with_history=True, with_clan=True)
        self.players = [self.good_player, self.medium_player, self.bad_player, self.irrelevant_player, self.new_player]

        self._setup_rules()
        PlayerCube.create_view()

    def _setup_rules(self):
        self.goal = PlayerClanRuleGoalFactory.create(clan=self.clan, applies_to=['member', 'member', 'member'])
        self.assertEquals(self.goal.applies_to, ['member'])

        self.old_player_predicate = PlayerClanRuleFactory.create(
            goal=None,
            field='joined_clan',
            operator='<',
            value=timezone.timedelta(weeks=-2),
            value_type='interval',
        )
        self.trophy_rule = PlayerClanRuleFactory.create(
            goal=self.goal,
            field='trophies',
            value='5000',
            operator='<',
            predicate=self.old_player_predicate,
            is_promoting_rule=False
        )

    # Fired by test_materialized_view
    def _test_view_creation(self):
        PlayerCube.create_view()
        self.assertEquals(PlayerCube.objects.count(), len(self.players))

    # Fired by test_materialized_view +after+ test_view_creation
    def _test_view_refresh(self):
        # Red herring player
        other_clan = ClanFactory.create()
        PlayerFactory.create(with_history=True, with_clan=True, level=11, clan=other_clan)
        PlayerCube.refresh_view()
        self.assertEquals(PlayerCube.objects.count(), len(self.players) + 1)

    def test_materialized_view(self):
        self._test_view_creation()
        self._test_view_refresh()

    def test_rule_as_filters(self):
        # When the value is an int
        self.assertEquals(
            PlayerClanRule(value=100, field='some_field', operator='<', value_type='int').as_filters(),
            Q(some_field__lte=100)
        )
        # When the value is a string
        self.assertEquals(
            PlayerClanRule(value='world', field='hello', operator='=', value_type='str').as_filters(),
            Q(hello='world')
        )
        # When the value is a date
        value = timezone.datetime(1991, 11, 23, 14, 18, 27)
        self.assertEquals(
            PlayerClanRule(value=value.strftime('%Y-%m-%d %H:%M:%S'), field='birth_date', value_type='date', operator='<').as_filters(),
            Q(birth_date__lte=value) | Q(birth_date__isnull=True)
        )
        # When the value is an interval
        time = self.old_player_predicate.VALUE_TYPE_HANDLERS['interval'](self.old_player_predicate.value)
        self.assertRegexpMatches(
            str(PlayerClanRule.objects.get(id=self.old_player_predicate.id).as_filters()),
            r"\(OR: \('joined_clan__lte', datetime\.datetime\(%d, %d, %d, %d, %d, %d, \d+, tzinfo=<UTC>\)\), \('joined_clan__isnull', True\)\)" % (
                time.year, time.month, time.day, time.hour, time.minute, time.second
            )
        )
        # When the operator is 'between"
        self.assertEquals(
            PlayerClanRule(value=1, value_bound=10, value_type='int', field='teeth', operator='between').as_filters(),
            Q(teeth__gte=1) & Q(teeth__lte=10)
        )
        # When there is a predicate
        self.assertEquals(
            PlayerClanRule(value=0, operator='>', field='hair', predicate=PlayerClanRule(value=1, operator='=', field='foo')).as_filters(),
            Q(hair__gte=0) & Q(foo=1)
        )

    def test_goal_as_filters(self):
        goal = PlayerClanRuleGoalFactory.create(name='funny person', applies_to=['member'])
        jokes_rule = PlayerClanRuleFactory.create(
            goal=goal,
            field='jokes_known',
            operator='>',
            value=10,
            predicate=PlayerClanRuleFactory.create(field='topics', operator='>', value=5),
        )
        PlayerClanRuleFactory.create(goal=goal, field='iq', operator='<', value=30)
        self.assertEquals(
            goal.as_filters(),
            ((Q(jokes_known__gte=10) & Q(topics__gte=5)) | Q(iq__lte=30)) & Q(clan_role__in=['member'])
        )

        # Deleting the predicate doesn't delete the parent rule
        jokes_rule.predicate.delete()
        self.assertIsNone(PlayerClanRule.objects.get(id=jokes_rule.id).predicate)

    def test_rule_execution(self):
        goal_results = self.goal.execute_on(PlayerCube.objects.all())
        bad_player = PlayerCube.objects.get(id=self.bad_player.id)
        self.assertEquals(type(goal_results), QuerySet)
        self.assertCountEqual(list(goal_results), [bad_player])

    def test_parse_interval(self):
        test_cases = [
            timezone.timedelta(hours=1),
            timezone.timedelta(hours=1000),
            timezone.timedelta(days=1),
            timezone.timedelta(days=9999),
            timezone.timedelta(hours=-1),
            timezone.timedelta(hours=-1000),
            timezone.timedelta(weeks=-10),
        ]
        for case in test_cases:
            self.assertEquals(case, parse_interval(str(case)))
        self.assertEquals(timezone.timedelta(hours=2), parse_interval('02:00:00'))
        self.assertEquals(timezone.timedelta(days=14), parse_interval('14 days'))
        self.assertEquals(timezone.timedelta(days=-14), parse_interval('-14 days'))
        self.assertEquals(timezone.timedelta(), parse_interval(None))
        self.assertEquals(timezone.timedelta(), parse_interval(''))
