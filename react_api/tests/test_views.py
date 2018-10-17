from datetime import timedelta

from django.conf import settings
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone

from react_api.models import Player, PlayerClanHistory, Clan, ClanHistory


class ViewsTestCase(TestCase):
    def setUp(self):
        self.clans = [Clan(name="Clan " + str(i), tag=settings.MAIN_CLAN + (str(i + 1) if i else '')) for i in range(2)]
        self.players = [Player(name="Player " + str(i), tag="ABC" + str(i)) for i in range(3)]
        for c in self.clans: c.save()
        for p in self.players:
            p.save()
            pch = PlayerClanHistory(joined_clan=None, left_clan=None, player=p, clan=self.clans[0])
            pch.save()

        now = timezone.now()
        ch = ClanHistory(clan=self.clans[0], score=5555, badge="bye", last_refresh=now - timedelta(minutes=1))
        ch.save()
        ch = ClanHistory(clan=self.clans[0], score=9999, badge="hello", last_refresh=now)
        ch.save()
        ch = ClanHistory(clan=self.clans[1], score=1)
        ch.save()

    def _test_route(self, route, status_code=200, **kwargs):
        response = self.client.get(reverse(route, **kwargs), format='json')
        self.assertEqual(response.status_code, status_code)
        return response.data

    def test_home(self):
        data = self._test_route('home')
        self.assertIn('url', data)
        self.assertNotEquals(data['url'][:3], '/api')
        self.assertEqual(data['url'][0], '/')

    def test_clans_list_view(self):
        data = self._test_route('clans_list')
        self.assertEqual(len(data), 2)

        i = 1
        self.assertEqual(data['main']['name'], self.clans[0].name)
        for clan in data['family']:
            self.assertEqual(clan['name'], self.clans[i].name)
            i += 1

    def test_clan_info(self):
        data = self._test_route('clan_info', args=[settings.MAIN_CLAN])
        self.assertGreaterEqual(len(data), 3)
        self.assertIn('details', data)
        self.assertEqual(data['details']['score'], 9999)
        self.assertEqual(data['details']['badge'], 'hello')

        data = self._test_route('clan_info', args=[settings.MAIN_CLAN + '2'])
        self.assertGreaterEqual(len(data), 3)
        self.assertIn('details', data)
        self.assertFalse(data['details']['badge'])

        self._test_route('clan_info', args=['A'], status_code=404)

    def test_clan_members(self):
        data = self._test_route('clan_info', args=[settings.MAIN_CLAN])
        self.assertGreaterEqual(len(data), 3)

        self._test_route('clan_members', args=['A'], status_code=404)

    def test_player_wars(self):
        self._test_route('clan_wars', args=['A'], status_code=404)

    def test_player_clan(self):
        data = self._test_route('clan_info', args=[settings.MAIN_CLAN])
        self.assertGreaterEqual(len(data), 3)
        self.assertIn('last_refresh', data['details'])

        self._test_route('player_clan', args=['A'], status_code=404)

    def test_player_info(self):
        data = self._test_route('clan_info', args=[settings.MAIN_CLAN])
        self.assertGreaterEqual(len(data), 3)
        self.assertIn('details', data)
        self.assertGreaterEqual(len(data['details']), 9)

        self._test_route('player_info', args=['A'], status_code=404)
