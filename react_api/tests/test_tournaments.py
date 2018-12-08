from django.test import TestCase
from django.urls import reverse

from react_api.helpers.api.tournament import refresh_open_tournaments
from react_api.tests.fake_api_client import FakeAPIClient


class TournamentsTestCase(TestCase):
    def setUp(self):
        self.api_client = FakeAPIClient()

    def _test_route(self, route, status_code=200, **kwargs):
        response = self.client.get(reverse(route, **kwargs), format='json')
        self.assertEqual(response.status_code, status_code)
        return response.data

    def test_helpers(self):
        r = refresh_open_tournaments(self.api_client, max=1)
        self.assertTrue(r.success)
        self.assertIsNone(r.error)

    def test_view_playable(self):
        data = self._test_route('playable_tournaments')
        self.assertEqual(len(data), 1)
