from datetime import timedelta

from django.conf import settings
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone

from backend.models import PlayerCube
from .factories.clan_rule_matcher import PlayerClanRuleGoalFactory, PlayerClanRuleFactory
from .factories.clashroyale import PlayerFactory, ClanFactory, ClanHistoryFactory, PlayerStatsHistoryFactory
from ..lib.clan_rule_matcher.serializers import PlayerClanRuleSerializer


class ViewsTestCase(TestCase):
    def setUp(self):
        self.clans = [
            ClanFactory.create(name="Main clan", tag=settings.MAIN_CLAN),
            ClanFactory.create()
        ]
        self.players = [
            PlayerFactory.create(
                name="Player " + str(i),
                tag="ABC" + str(i),
                level=13 - i,
                with_history=True,
                with_clan=True,
                clan=self.clans[0]
            ) for i in range(3)
        ]

        now = timezone.now()
        ClanHistoryFactory.create(clan=self.clans[0], score=5555, badge="bye", last_refresh=now - timedelta(days=1))
        ClanHistoryFactory.create(clan=self.clans[0], score=9999, badge="hello", last_refresh=now)
        ClanHistoryFactory.create(clan=self.clans[1], score=1)

    def _test_route(self, route, status_code=200, **kwargs):
        response = self.client.get(reverse(route, **kwargs), format='json')
        self.assertEqual(response.status_code, status_code)
        return response.data

    def test_clans_list_view(self):
        data = self._test_route('clans_list')
        self.assertEqual(len(data), 2)

        self.assertEqual(data['main'], self.clans[0].tag)
        self.assertTrue(self.clans[1].tag in data['family'])

    def test_clan_info(self):
        data = self._test_route('clan_info', args=[settings.MAIN_CLAN])
        self.assertGreaterEqual(len(data), 3)
        self.assertIn('details', data)
        self.assertEqual(data['details']['score'], 9999)
        self.assertEqual(data['details']['badge'], 'hello')

        data = self._test_route('clan_info', args=[self.clans[1].tag])
        self.assertGreaterEqual(len(data), 3)
        self.assertIn('details', data)

        self._test_route('clan_info', args=['AWILDTAG'], status_code=404)

    def test_clan_members(self):
        data = self._test_route('clan_info', args=[settings.MAIN_CLAN])
        self.assertGreaterEqual(len(data), 3)

        self._test_route('clan_members', args=['AWILDTAG'], status_code=404)

    def test_player_wars(self):
        self._test_route('clan_wars', args=['AWILDTAG'], status_code=404)

    def test_player_clan(self):
        data = self._test_route('clan_info', args=[settings.MAIN_CLAN])
        self.assertGreaterEqual(len(data), 3)
        self.assertIn('last_refresh', data['details'])

        self._test_route('clan_info', args=['AWILDTAG'], status_code=404)

    def test_player_info(self):
        data = self._test_route('player_info', args=[self.players[0].tag])
        self.assertGreaterEqual(len(data), 3)
        self.assertIn('details', data)
        self.assertGreaterEqual(len(data['details']), 9)

        self._test_route('player_info', args=['AWILDTAG'], status_code=404)

    def test_player_activity(self):
        data = self._test_route('player_activity', args=[self.players[0].tag])
        self.assertEquals(len(data), 2)
        self.assertIn('stats', data)
        self.assertIn('wars', data)

        self._test_route('player_activity', args=['AWILDTAG'], status_code=404)

    def test_player_stats_per_day(self):
        # Test setup
        long_time_ago = timezone.make_aware(timezone.datetime(2011, 11, 11))
        histories = [
            PlayerStatsHistoryFactory.create(player=self.players[0], level=10, timestamp=long_time_ago),
            PlayerStatsHistoryFactory.create(player=self.players[0], level=10, timestamp=long_time_ago + timezone.timedelta(minutes=15)),
            PlayerStatsHistoryFactory.create(player=self.players[0], level=10, timestamp=long_time_ago + timezone.timedelta(hours=23, minutes=59, seconds=59))
        ]

        data = self._test_route('player_stats_per_day', args=[self.players[0].tag])
        self.assertEquals(len(data), 2)

        self._test_route('player_stats_per_day', args=['AWILDTAG'], status_code=404)

        # Test cleanup
        for h in histories:
            h.delete()

    def test_player_goal_rules(self):
        # Test setup
        goal = PlayerClanRuleGoalFactory.create(clan=self.clans[0])
        rule = PlayerClanRuleFactory.create(field='level', operator='=', value='13', goal=goal)

        data = self._test_route('player_goal_rules', args=[settings.MAIN_CLAN])
        self.assertEqual(len(data), 1)
        result_goal = data[0]
        self.assertEquals(result_goal['id'], goal.id)
        self.assertCountEqual(result_goal['rules'], [PlayerClanRuleSerializer(rule).data])
        self.assertCountEqual(result_goal['matching_players'], PlayerCube.objects.filter(id=self.players[0].id).values())

        self._test_route('player_goal_rules', args=['AWILDTAG'], status_code=404)

        # Test cleanup
        goal.delete()
        rule.delete()
