import os
import unittest
from io import StringIO
from box import Box

import clashroyale
from clashroyale.errors import NotResponding
from django.conf import settings
from django.test import TestCase

from backend.helpers.api.clan import refresh_clan_details
from backend.helpers.api.constants import refresh_constants
from backend.helpers.api.helpers import command_print, run_refresh_method
from backend.helpers.api.player import refresh_player_profile
from backend.models import (Clan,
                            Player,
                            ClanHistory,
                            PlayerClanHistory,
                            PlayerClanStatsHistory,
                            ClanWar,
                            PlayerClanWar, PlayerStatsHistory, Card, PlayerCardLevel, RoyaleAPIError)


class HelpersTestCase(unittest.TestCase):
    def setUp(self):
        self.stdout = StringIO()
        self.stderr = StringIO()

    def _get_stream(self, stream):
        value = getattr(self, stream).getvalue().strip()
        getattr(self, stream).truncate(0)
        return value

    def test_command_print(self):
        command_print(self, "True is %s and None is %s", True, None)
        output = self._get_stream('stdout')
        self.assertEqual(output, "True is True and None is ???")

    def test_run_refresh_method(self):
        output = []
        func = lambda _, __, x: output.append('success')
        run_refresh_method(None, None, func, [0])
        self.assertIn('success', output, 1)

        options = {'verbose': True}
        func = lambda _, __, x: self.assertEqual(x, 42)
        run_refresh_method(self, options, func, [42])

        # test not responding
        api_errors_count = RoyaleAPIError.objects.count()
        func = lambda x, y, z: (_ for _ in ()).throw(NotResponding)
        run_refresh_method(self, options, func, [42])
        output = self._get_stream('stderr')
        self.assertNotEqual('', output)
        self.assertEqual(RoyaleAPIError.objects.count(), api_errors_count + 1)

        options.update(clan="a")
        options.update(player="b")
        func = lambda _, __, x: self.assertEqual(True, x.refresh)
        run_refresh_method(self, options, func, [None, None])

    # TODO: def test_store_battle_players(self):


class TopLevelHelpersTestCase(TestCase):
    def setUp(self):
        self.api_client = clashroyale.RoyaleAPI(token=settings.ROYALE_API_KEY, timeout=45)
        self.stdout = StringIO()
        self.stderr = StringIO()

    def _run_refresh_method(self, func, data):
        try:
            run_refresh_method(self, {'verbose': True, 'battles': True}, func, [data], tries=1, api_client=self.api_client)
        except clashroyale.RequestError:
            pass

    def _test_refresh_clan_details(self):
        self._run_refresh_method(refresh_clan_details, Clan(tag=settings.MAIN_CLAN))
        clan = self.api_client.get_clan(settings.MAIN_CLAN)
        self.assertEqual(Clan.objects.count(), 1)
        self.assertGreaterEqual(Player.objects.count(), clan.member_count)
        self.assertEqual(ClanHistory.objects.count(), 1)
        self.assertEqual(PlayerClanHistory.objects.count(), clan.member_count)
        self.assertEqual(PlayerClanStatsHistory.objects.count(), clan.member_count)
        self.assertEqual(PlayerClanHistory.objects.filter(joined_clan__isnull=True).count(), clan.member_count)
        wars = self.api_client.get_clan_war_log(settings.MAIN_CLAN)
        self.assertEqual(ClanWar.objects.count(), len(wars))
        self.assertGreaterEqual(PlayerClanWar.objects.count(), len(wars) * 15)

    def _test_refresh_player_details(self):
        leader = Player.objects.get(playerclanstatshistory__clan_role='leader')
        self._run_refresh_method(refresh_player_profile, leader)
        self.assertEqual(Clan.objects.count(), 1)
        self.assertEqual(PlayerClanHistory.objects.filter(player=leader).count(), 1)
        self.assertEqual(PlayerStatsHistory.objects.count(), 1)
        self.assertGreaterEqual(Card.objects.count(), 8)
        self.assertGreaterEqual(PlayerCardLevel.objects.count(), 8)

    def test_clan_details_then_player_profile(self):
        self._test_refresh_clan_details()
        self._test_refresh_player_details()

    def test_refresh_constants(self):
        refresh_constants(self.api_client)
        constants = self.api_client.get_constants()
        constants = Box(constants.raw_data)
        for key in constants:
            path = os.path.join(settings.CONSTANTS_DIR, key + '.json')
            self.assertTrue(os.path.isfile(path))
