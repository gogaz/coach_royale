import contextlib
import datetime
import io

import clashroyale

from box import BoxList, Box

from django.test import TestCase
from unittest.mock import mock_open, patch
from backend.models import PlayerStatsHistory
from backend.lib.official_api import BaseConsumer, ConstantsConsumer
from backend.lib.official_api.clan import read_clan_ranking

from .factories.clashroyale import PlayerStatsHistoryFactory, PlayerFactory, ClanHistoryFactory


class BaseConsumerTestCase(TestCase):
    def test_init(self):
        # Test client assignation
        self.assertIsInstance(BaseConsumer().client, clashroyale.OfficialAPI)
        self.assertIsInstance(BaseConsumer(client={'foo': 'bar'}).client, dict)
        # Test verbosity
        self.assertIs(BaseConsumer().verbose, True)
        self.assertIs(BaseConsumer(verbose=False).verbose, False)
        self.assertIsInstance(BaseConsumer().now, datetime.datetime)

    def test_update_current_time(self):
        consumer = BaseConsumer()
        now = consumer.now
        consumer._update_current_time()
        self.assertNotEquals(now, consumer.now)

    def test_log(self):
        consumer = BaseConsumer()
        with io.StringIO() as buf:
            with contextlib.redirect_stdout(buf):
                consumer._log('message')
            self.assertIn('INFO', buf.getvalue())
            self.assertIn('message', buf.getvalue())
        with io.StringIO() as buf:
            with contextlib.redirect_stdout(buf):
                consumer._log('message', 'ERROR')
            self.assertIn('ERROR', buf.getvalue())
            self.assertIn('message', buf.getvalue())

    def test_get_last_from_database(self):
        player = PlayerFactory.create()
        histories = [PlayerStatsHistoryFactory.create(player=player) for _ in range(10)]
        # Red herring
        _ = [PlayerStatsHistoryFactory.create() for _ in range(10)]
        latest = BaseConsumer()._get_last_from_database(PlayerStatsHistory, player=player)
        self.assertEquals(latest.id, histories[-1].id)
        self.assertRaises(
            IndexError,
            BaseConsumer()._get_last_from_database,
            PlayerStatsHistory,
            player=PlayerFactory.create()
        )
        self.assertIs(
            None,
            BaseConsumer()._get_last_from_database(PlayerStatsHistory, player=PlayerFactory.create(), raise_error=False)
        )


class ClanConsumerTestCase(TestCase):
    def test_read_clan_ranking(self):
        history = ClanHistoryFactory.create()
        self.assertIs(None, read_clan_ranking([], 'ABC', history, 'blah'))
        self.assertIsInstance(
            read_clan_ranking(
                BoxList([{'tag': '#AAA'}, {'tag': '#ABC', 'rank': 2, 'previous_rank': 42}]),
                'ABC',
                history,
                'local'
            ),
            Box
        )
        self.assertEquals(2, history.local_rank)
        self.assertEquals(42, history.prev_local_rank)


class ConstantsConsumerTestCase(TestCase):
    def test_refresh_cards(self):
        m = mock_open(read_data='[{"id":1}]')
        with patch('pathlib.Path.open', m):
            subject = ConstantsConsumer().refresh_cards()
            self.assertEquals(subject, [{"id": 1}])
        m.assert_called_once_with('/code/static/constants/arenas.json', 'w')
