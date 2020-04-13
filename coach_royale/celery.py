# Copied from https://docs.celeryproject.org/en/stable/django/first-steps-with-django.html
from __future__ import absolute_import, unicode_literals
import os

from celery import Celery
from django.apps import apps

# set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'coach_royale.settings')

app = Celery('coach_royale')

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
# - namespace='CELERY' means all celery-related configuration keys
#   should have a `CELERY_` prefix.
app.config_from_object("django.conf:settings", namespace='CELERY')

# Load task modules from all registered Django app configs.
app.autodiscover_tasks(lambda: [n.name for n in apps.get_app_configs()])


@app.task(bind=True)
def debug_task(self):
    print('Request: {0!r}'.format(self.request))
