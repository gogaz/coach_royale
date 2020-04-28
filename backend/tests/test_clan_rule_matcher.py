from django.db.models import Q
from django.test import TestCase
from django.utils import timezone

from backend.lib.clan_rule_matcher.models import PlayerCube, PlayerClanRule, parse_interval

from .factories.clan_rule_matcher import PlayerClanRuleGoalFactory, PlayerClanRuleFactory
from .factories.clashroyale import ClanFactory, PlayerFactory, PlayerClanWarFactory


class ClanRuleMatcherTestCase(TestCase):
    def setUp(self):
        self.clan = ClanFactory.create(with_history=True, name="Gang of Musketeers", tag="AAA")
        self.good_player = PlayerFactory.create(with_history=True, with_clan=True, clan=self.clan)
        self.medium_player = PlayerFactory.create(
            with_history=True,
            with_clan=True,
            clan=self.clan,
            trophies=4500,
            clan_rank=20,
            level=12,
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
            current_trophies=3000,
            joined_clan=timezone.now() - timezone.timedelta(days=5)
        )
        # Red herring
        self.irrelevant_player = PlayerFactory.create(with_history=True, with_clan=True)
        self.players = [self.good_player, self.medium_player, self.bad_player, self.irrelevant_player, self.new_player]
        self.wars = self._setup_wars(self.good_player, self.clan, [
            *[{'final_battles_wins': 1} for _ in range(8)],
            {'final_battles_wins': 0},
            {'final_battles_wins': 0},
        ])
        self.wars += self._setup_wars(self.medium_player, self.clan, [
            *[{'final_battles_wins': 1} for _ in range(4)],
            *[{'final_battles_wins': 0} for _ in range(5)],
            {'final_battles_misses': 1},
        ])
        bad_player_wars = [
            *[{'final_battles_wins': 0} for _ in range(6)],
            {'final_battles_wins': 1},
            {'final_battles_wins': 1},
            {'final_battles_misses': 2},
            {'final_battles_misses': 2},
        ]
        new_player_wars = [{'final_battles_wins': 0} for _ in range(3)]

        self.wars += self._setup_wars(self.bad_player, self.clan, bad_player_wars)
        self.wars += self._setup_wars(self.irrelevant_player, self.clan, bad_player_wars)
        self.wars += self._setup_wars(self.new_player, self.clan, new_player_wars)

        self._setup_rules()
        PlayerCube.create_view()

    def _setup_wars(self, player, clan, wars, **kwargs):
        player_wars = list()
        for war in wars:
            player_wars.append(PlayerClanWarFactory.create(player=player, clan=clan, **war, **kwargs))
        return player_wars

    def _setup_rules(self):
        self.goal = PlayerClanRuleGoalFactory.create(clan=self.clan, applies_to='member')
        self.trophy_rule = PlayerClanRuleFactory.create(goal=self.goal, field='trophies', value='4000')
        self.wins_rule = PlayerClanRuleFactory.create(goal=self.goal, field='final_battles_won', value='5')
        self.old_player_predicate = PlayerClanRuleFactory.create(
            goal=None,
            field='joined_clan',
            operator='<',
            value=timezone.timedelta(weeks=-3),
            value_type='interval',
            is_promoting_rule=False
        )
        self.misses_rule = PlayerClanRuleFactory.create(
            goal=self.goal,
            field='final_battles_missed',
            value='3',
            is_promoting_rule=False,
            predicate=self.old_player_predicate,
        )

    def _test_view_creation(self):
        PlayerCube.create_view()
        self.assertEquals(PlayerCube.objects.count(), len(self.players))

    def _test_view_refresh(self):
        other_clan = ClanFactory.create()
        player_other_clan = PlayerFactory.create(with_history=True, with_clan=True, level=11, clan=other_clan)
        self._setup_wars(player_other_clan, other_clan, [{} for _ in range(10)])
        PlayerCube.refresh_view()
        self.assertEquals(PlayerCube.objects.count(), len(self.players) + 1)

    def test_view(self):
        self._test_view_creation()
        self._test_view_refresh()

    def test_as_filters(self):
        self.assertEquals(
            PlayerClanRule.objects.get(id=self.trophy_rule.id).as_filters(),
            Q(trophies__gte=4000)
        )
        self.assertEquals(
            PlayerClanRule.objects.get(id=self.wins_rule.id).as_filters(),
            Q(final_battles_won__gte=5)
        )
        time = timezone.now() + self.old_player_predicate.value
        self.assertRegexpMatches(
            str(PlayerClanRule.objects.get(id=self.old_player_predicate.id).as_filters()),
            r"\(OR: \('joined_clan__lte', datetime\.datetime\(%d, %d, %d, %d, %d, %d, \d+, tzinfo=<UTC>\)\), \('joined_clan__isnull', True\)\)" % (
                time.year, time.month, time.day, time.hour, time.minute, time.second
            )
        )
        self.assertEquals(
            PlayerClanRule.objects.get(id=self.misses_rule.id).as_filters(),
            Q(final_battles_missed__gte=3)
        )

    def test_rule_execution(self):
        goal_results = self.goal.execute_on(PlayerCube.objects.all())
        good_player = PlayerCube.objects.get(id=self.good_player.id)
        medium_player = PlayerCube.objects.get(id=self.medium_player.id)
        bad_player = PlayerCube.objects.get(id=self.bad_player.id)
        self.assertEquals(type(goal_results), type(dict()))
        self.assertCountEqual(list(goal_results[self.trophy_rule].all()), [good_player, medium_player])
        self.assertCountEqual(list(goal_results[self.wins_rule].all()), [good_player, medium_player])
        self.assertCountEqual(list(goal_results[self.misses_rule].all()), [bad_player])

    def test_parse_interval(self):
        test_cases = [
            timezone.timedelta(hours=1),
            timezone.timedelta(hours=1000),
            timezone.timedelta(days=1),
            timezone.timedelta(days=9999),
            timezone.timedelta(hours=-1),
            timezone.timedelta(hours=-1000),
            timezone.timedelta(weeks=-10)
        ]
        for case in test_cases:
            self.assertEquals(case, parse_interval(str(case)))
        self.assertEquals(timezone.timedelta(), parse_interval(None))
        self.assertEquals(timezone.timedelta(), parse_interval(''))
