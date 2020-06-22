import urllib.request
import json

from backend.models import Card, Arena
from .base import APIConsumer as BaseConsumer


class APIConsumer(BaseConsumer):
    CARD_CONSTANTS_URL = 'https://royaleapi.github.io/cr-api-data/json/cards.json'
    ARENA_CONSTANTS_URL = 'https://royaleapi.github.io/cr-api-data/json/arenas.json'

    # from backend.lib.official_api import ConstantsConsumer;ConstantsConsumer().refresh_arenas()
    def refresh_constants(self):
        self.refresh_cards()
        self.refresh_arenas()

    # Cards are required to store levels for each player
    def refresh_cards(self):
        with urllib.request.urlopen(self.CARD_CONSTANTS_URL) as response:
            cards = json.loads(response.read())

        for data in cards:
            card, created = Card.objects.get_or_create(key=data['key'])

            card.card_id = data['id']
            card.name = data['name']
            card.elixir = data['elixir']
            card.type = data['type']
            card.rarity = data['rarity']
            card.arena = data['arena']
            card.blob = data
            card.save()
            if created:
                self._log('New card released: ' + card.name)

        self._log('Updated %d Card entries' % len(cards))

    # Arenas are required by the front-end
    def refresh_arenas(self):
        with urllib.request.urlopen(self.ARENA_CONSTANTS_URL) as response:
            arenas = json.loads(response.read())

        for data in arenas:
            whitelisted_keys = {'name', 'key', 'arena', 'is_in_use'}

            lose_trophy_score = data.get('lose_trophy_score')
            if isinstance(lose_trophy_score, int):
                trophy_limits = {'0': lose_trophy_score, '1': lose_trophy_score}
            elif lose_trophy_score is None:
                trophy_limits = {'0': data['trophy_limit'], '1': data['trophy_limit']}
            else:
                trophy_limits = lose_trophy_score

            augmented_data = {
                **{key: data[key] for key in data.keys() & whitelisted_keys},
                'min_trophy_limit': trophy_limits['0'],
                'max_trophy_limit': trophy_limits['1'],
                'blob': data,
            }

            db_arena, created = Arena.create_or_get(
                arena_id=data['id'],
                defaults=augmented_data
            )
            db_arena.__dict__.update(**augmented_data)
            db_arena.save()

        self._log('Updated %d Arena entries' % len(arenas))
