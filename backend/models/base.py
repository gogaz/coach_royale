from django.db import models


class BaseModel(models.Model):
    id = models.AutoField(primary_key=True)

    class Meta:
        abstract = True


class HistoryModel(BaseModel):
    timestamp = models.DateTimeField(null=True)
    last_refresh = models.DateTimeField(null=True)

    class Meta:
        abstract = True

    @classmethod
    def create_or_find(cls, **kwargs):
        try:
            return cls.objects.get_or_create(**kwargs)
        except cls.MultipleObjectsReturned:
            return cls.objects.filter(**kwargs).order_by('-timestamp')[0], False
