import os

from box import Box
from clashroyale.royaleapi import Client
from django.conf import settings


def refresh_constants(api_client: Client):
    constants = api_client.get_constants()
    constants = Box(constants.raw_data)
    for key in constants:
        constants[key].to_json(filename=os.path.join(settings.CONSTANTS_DIR, key + '.json'))
