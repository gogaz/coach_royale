import os

import urllib.request
import json
from pathlib import Path

from box import Box, BoxList
from django.conf import settings

from backend.models import Card
from .base import APIConsumer as BaseConsumer


def download_and_read_json(url, filename):
    file_path = os.path.join(settings.CONSTANTS_DIR, filename)
    urllib.request.urlretrieve(url, file_path)
    with Path(file_path).open(encoding='utf8') as f:
        data = json.load(f)
    return BoxList(data, camel_killer_box=True) if type(data) == list else Box(data, camel_killer_box=True)


class APIConsumer(BaseConsumer):
    CARD_CONSTANTS_URL = 'https://royaleapi.github.io/cr-api-data/json/cards.json'
    ARENA_CONSTANTS_URL = 'https://royaleapi.github.io/cr-api-data/json/arenas.json'

    def refresh_constants(self):
        self.refresh_cards()
        self.refresh_arenas()

    # Cards are required to store levels for each player
    def refresh_cards(self):
        cards = download_and_read_json(self.CARD_CONSTANTS_URL, self.CARD_CONSTANTS_URL.split('/')[-1])
        for data in cards:
            # FIXME: use card_id instead of key when all records are populated
            card, created = Card.objects.get_or_create(key=data.key)

            card.card_id = data.id
            card.name = data.name
            card.elixir = data.elixir
            card.type = data.type
            card.rarity = data.rarity
            card.arena = data.arena
            card.save()
            if created:
                self._log('New card released: ' + card.name)

        self._log('Updated %d Card entries' % len(cards))

    # Arenas are required by the front-end
    def refresh_arenas(self):
        download_and_read_json(self.ARENA_CONSTANTS_URL, self.ARENA_CONSTANTS_URL.split('/')[-1])
