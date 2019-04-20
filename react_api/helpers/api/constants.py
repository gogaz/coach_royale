import os

from box import BoxList
from clashroyale.royaleapi import Client
from django.conf import settings


def update_constants(api_client: Client):
    constants = api_client.get_constants()
    constants = BoxList(constants.raw_data)
    constants.to_json(filename=os.path.join(settings.STATICFILES_DIRS, 'constants.json'))