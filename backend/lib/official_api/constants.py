import os

import urllib.request
import json
from pathlib import Path

from box import Box
from django.conf import settings

from backend.models import Card
from .base import APIConsumer as BaseConsumer


def download_and_read_json(url, filename):
    file_path = os.path.join(settings.BASE_DIR, os.path.join('constants', filename))
    urllib.request.urlretrieve(url, file_path)
    with Path(file_path).open(encoding='utf8') as f:
        data = json.load(f)
    return Box(data, camel_killer_box=True)


class APIConsumer(BaseConsumer):
    CARD_CONSTANTS_URL = 'https://royaleapi.github.io/cr-api-data/json/cards.json'
    ARENA_CONSTANTS_URL = 'https://royaleapi.github.io/cr-api-data/json/arenas.json'

    def refresh_constants(self):
        self.refresh_cards()
        self.refresh_arenas()

    # Cards are required to store levels for each player
    def refresh_cards(self):
        cards = download_and_read_json(self.CARD_CONSTANTS_URL, 'cards.json')
        for card in cards:
            Card.instance_from_data(card)

    # Arenas are required by the front-end
    def refresh_arenas(self):
        download_and_read_json(self.ARENA_CONSTANTS_URL, 'arenas.json')
