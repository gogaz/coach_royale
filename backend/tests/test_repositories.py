import datetime

from django.test import TestCase
from django.utils import timezone

from backend.models import Player, PlayerClanHistory, Clan


class RepositoryTestCase(TestCase):
    def setUp(self):
        self.players = [Player(name="Player " + str(i), tag='ABCD' + str(i)) for i in range(3)]
        self.clans = [Clan(name="Clan " + str(i), tag="ABCD" + str(i)) for i in range(2)]
        for p in self.players:
            p.save()
        for c in self.clans:
            c.save()

        self.clan_history = {p: [] for p in self.players}
        self._setUpClanHistory()

    def _setUpClanHistory(self):
        now = timezone.now()
        # Clan history for Player1
        player = self.players[0]
        self.clan_history[player].append(PlayerClanHistory(joined_clan=None,
                                                           left_clan=None,
                                                           clan=self.clans[0],
                                                           player=player))
        # Clan history for Player2
        # leaves clan 0 and goes to clan 1
        player = self.players[1]
        self.clan_history[player].append(PlayerClanHistory(joined_clan=None,
                                                           left_clan=now,
                                                           clan=self.clans[0],
                                                           player=player))
        self.clan_history[player].append(PlayerClanHistory(joined_clan=now,
                                                           left_clan=None,
                                                           clan=self.clans[1],
                                                           player=player))
        # Clan history for Player3
        # leaves clan 0, goes to clan 1 then comes back to clan 0
        player = self.players[2]
        self.clan_history[player].append(PlayerClanHistory(joined_clan=now - datetime.timedelta(10),
                                                           left_clan=now - datetime.timedelta(1),
                                                           clan=self.clans[0],
                                                           player=player))
        self.clan_history[player].append(PlayerClanHistory(joined_clan=now - datetime.timedelta(1),
                                                           left_clan=now,
                                                           player=player,
                                                           clan=self.clans[1]))
        self.clan_history[player].append(PlayerClanHistory(joined_clan=now,
                                                           left_clan=None,
                                                           player=player,
                                                           clan=self.clans[0]))
        for val in self.clan_history.values():
            for pch in val:
                pch.save()

    def test_player_in_clan(self):
        pch_1 = self.clans[0].get_players().count()
        self.assertEqual(pch_1, 2)
        pch_2 = self.clans[0].get_players(timezone.now() - datetime.timedelta(1)).count()
        self.assertEqual(pch_2, 2)
        pch_3 = self.clans[1].get_players(timezone.now() - datetime.timedelta(1)).count()
        self.assertEqual(pch_3, 1)
        pch_4 = self.clans[1].get_players().count()
        self.assertEqual(pch_4, 1)

    def test_clan_for_player(self):
        now = timezone.now()
        clan = self.players[0].get_clan(now)
        self.assertEqual('Clan 0', clan.name)
        clan = self.players[1].get_clan(now)
        self.assertEqual('Clan 1', clan.name)
        clan = self.players[2].get_clan(now)
        self.assertEqual('Clan 0', clan.name)

        clan = self.players[2].get_clan(now - datetime.timedelta(11))
        self.assertEqual(None, clan)
