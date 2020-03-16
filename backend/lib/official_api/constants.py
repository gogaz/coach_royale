import os

from box import Box
from clashroyale import OfficialAPI
from django.conf import settings

from backend.models import Card


def refresh_constants(api_client: OfficialAPI):
    constants = api_client.constants
    constants = Box(constants.raw_data)
    for key in constants:
        if isinstance(constants[key], str):
            continue
        constants[key].to_json(filename=os.path.join(settings.CONSTANTS_DIR, key + '.json'))


def refresh_cards(api_client: OfficialAPI):
    for card in api_client.constants.cards:
        Card.instance_from_data(card)
