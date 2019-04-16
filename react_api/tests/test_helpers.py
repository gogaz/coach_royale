import unittest
from io import StringIO

from clashroyale.errors import NotResponding
from django.test import TestCase

from react_api.helpers.api.clan import refresh_clan_details
from react_api.helpers.api.helpers import command_print, run_refresh_method
from react_api.models import (Clan,
                              Player,
                              ClanHistory,
                              PlayerClanHistory,
                              PlayerClanStatsHistory,
                              ClanWar,
                              PlayerClanWar)
from react_api.tests.fake_api_client import FakeAPIClient


class HelpersTestCase(unittest.TestCase):
    def setUp(self):
        self.stdout = StringIO()
        self.stderr = StringIO()

    def _get_stream(self, stream):
        value = getattr(self, stream).getvalue().strip()
        getattr(self, stream).truncate(0)
        return value

    def test_command_print(self):
        command_print(self, "True is %s and False is %s", True, False)
        output = self._get_stream('stdout')
        self.assertEqual(output, "True is True and False is ???")

    def test_run_refresh_method(self):
        output = []
        func = lambda _, __, x: output.append('success')
        run_refresh_method(None, None, func, [0])
        self.assertIn('success', output, 1)

        options = {'verbose': True}
        func = lambda _, __, x: self.assertEqual(x, 42)
        run_refresh_method(self, options, func, [42])

        # test not responding
        func = lambda x, y, z: (_ for _ in ()).throw(NotResponding)
        run_refresh_method(self, options, func, [42])
        output = self._get_stream('stderr')
        self.assertNotEqual('', output)

        options.update(clan="a")
        options.update(player="b")
        func = lambda _, __, x: self.assertEqual(True, x.refresh)
        run_refresh_method(self, options, func, [None, None])

    # TODO: def test_store_battle_players(self):


class ClanHelpersTestCase(TestCase):
    def setUp(self):
        self.api_client = FakeAPIClient()

    def test_refresh_clan_details(self):
        refresh_clan_details(None, {'verbose': False}, Clan(tag='ABCDEF'), self.api_client)
        self.assertEqual(Clan.objects.count(), 1)
        self.assertEqual(Player.objects.count(), 3)
        self.assertEqual(ClanHistory.objects.count(), 1)
        self.assertEqual(ClanHistory.objects.get().local_rank, 3)
        self.assertEqual(PlayerClanHistory.objects.count(), 3)
        self.assertEqual(PlayerClanStatsHistory.objects.count(), 3)
        self.assertEqual(PlayerClanHistory.objects.filter(joined_clan__isnull=True).count(), 3)
        self.assertEqual(ClanWar.objects.count(), 2)
        self.assertEqual(PlayerClanWar.objects.count(), 5)
        self.assertEqual(PlayerClanWar.objects.filter(player__tag='ABCDEF02').count(), 2)
        self.assertEqual(PlayerClanWar.objects.filter(player__tag='ABCDEF03').count(), 1)
