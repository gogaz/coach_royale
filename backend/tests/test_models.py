from box import Box
from django.test import TestCase

from backend.lib.models import int_difference_instances
from backend.models import Card


class ModelsTestCase(TestCase):
    def setUp(self):
        self.card = {
            'id': 123456,
            'name': 'Skeleton Army',
            'rarity': 'Epic',
            'iconUrls': {
                'medium': 'https://api-assets.clashroyale.com/cards/300/fAOToOi1pRy7svN2xQS6mDkhQw2pj9m_17FauaNqyl4.png',
            },
            'key': 'skeleton-army',
            'elixir': 3,
            'type': 'Troop',
            'arena': 0,
            'maxLevel': 13,
        }

    def _test_card_parsing(self):
        """Test the parsing of a single card"""
        data = Box(self.card, camel_killer_box=True)

        card = Card.instance_from_data(data)
        # Test required fields
        self.assertEqual(card.card_id, data.id)
        self.assertEqual(card.name, data.name)
        self.assertEqual(card.key, data.key)
        self.assertEqual(card.image, data.icon_urls.medium)

    def _test_card_uniqueness(self):
        """Cards with same key should not be duplicated"""
        data = {key: '' if key != 'key' else val for key, val in self.card.items()}
        Card.instance_from_data(Box(data, camel_killer_box=True))
        self.assertEqual(Card.objects.filter(key="skeleton-army").count(), 1)

    def test_card_parsing_then_uniqueness(self):
        self._test_card_parsing()
        self._test_card_uniqueness()

    def test_instances_differences(self):
        card1 = Card(name="Card 1", key='card-1', arena=12, elixir=42, max_level=1)
        card2 = Card(name="Card 2", key='card-2', elixir=12, max_level=12)
        diff = int_difference_instances(card1, card2, ('max_level',))
        self.assertIn('elixir', diff)
        self.assertNotIn('arena', diff)
        self.assertNotIn('key', diff)
        self.assertEqual(diff['elixir'], 30)
        self.assertNotIn('max_level', diff)
