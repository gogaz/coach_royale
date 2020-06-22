from django.core.exceptions import ObjectDoesNotExist, MultipleObjectsReturned
from django.db import models
from django.utils import timezone

from .fields import AutoDateTimeField


class BaseModel(models.Model):
    id = models.AutoField(primary_key=True)

    class Meta:
        abstract = True

    @classmethod
    def create_or_get(cls, defaults=None, **kwargs):
        if defaults is None:
            defaults = dict()

        try:
            return cls.objects.get(**kwargs), False
        except ObjectDoesNotExist:
            return cls.objects.create(**kwargs, **defaults), True
        except MultipleObjectsReturned:
            return cls.objects.filter(**kwargs).order_by('-id')[0], False


class HistoryModel(BaseModel):
    timestamp = models.DateTimeField(null=True)
    last_refresh = models.DateTimeField(null=True)

    class Meta:
        abstract = True


class EditableModel(BaseModel):
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = AutoDateTimeField(default=timezone.now)

    class Meta:
        abstract = True
