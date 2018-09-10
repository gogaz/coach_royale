from django.test import TestCase
from box import Box
from react_api.models import Card


class CardTestCase(TestCase):
    def test_animals_can_speak(self):
        """Animals that can speak are correctly identified"""
        data = {"name": "Skeleton Army",
                "level": 5,
                "maxLevel": 8,
                "rarity": "Epic",
                "requiredForUpgrade": 50,
                "icon": "https://api-assets.clashroyale.com/cards/300/fAOToOi1pRy7svN2xQS6mDkhQw2pj9m_17FauaNqyl4.png",
                "key": "skeleton-army",
                "elixir": 3,
                "type": "Troop",
                "arena": 0,
                "description": "Spawns an army of Skeletons. Meet Larry and his friends Harry, Gerry, Terry, Mary, etc.",
                "id": 26000012}
        data = Box(data)

        card = Card.instance_from_data(data)
        # Test required fields
        self.assertEqual(card.name, "Skeleton Army")
        self.assertEqual(card.key, 'skeleton-army')
        self.assertContains(card.icon, "http://")
        # Test unicity
        Card.instance_from_data(data)
        self.assertEqual(Card.objects.filter(key="skeleton-army").count(), 1)
