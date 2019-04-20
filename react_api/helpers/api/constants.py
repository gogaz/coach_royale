import os

from box import Box
from clashroyale.royaleapi import Client
from django.conf import settings


def refresh_constants(api_client: Client):
    constants = api_client.get_constants()
    constants = Box(constants.raw_data)
    constants.to_json(filename=os.path.join(settings.STATIC_ROOT, 'constants.json'))
