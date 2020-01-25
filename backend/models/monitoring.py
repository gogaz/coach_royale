import traceback

from django.db import models


class TournamentRefresh(models.Model):
    timestamp = models.DateTimeField()
    success = models.BooleanField()
    error = models.TextField(null=True)
    count = models.IntegerField(default=0)

    def __str__(self):
        return "[{1}] Refreshed {0.count} tournaments (success: {0.success})".format(self, self.timestamp.strftime("%Y-%m-%d %H:%M"))


class FullRefresh(models.Model):
    timestamp = models.DateTimeField()
    error = models.TextField(null=True)
    constants_updated = models.BooleanField()
    clans_count = models.IntegerField()
    players_count = models.IntegerField()

    def __str__(self):
        return "[{0}] Refreshed all clans & players (success: {1})".format(self.timestamp.strftime("%Y-%m-%d %H:%M"), self.error is None)


class BaseError(models.Model):
    clazz = models.CharField(max_length=256, null=True)
    traceback = models.TextField(null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        abstract = True


class RoyaleAPIError(BaseError):
    method = models.CharField(max_length=128, null=True)
    refresh_method = models.CharField(max_length=256, null=True)
    data = models.TextField(null=True)
    code = models.CharField(max_length=64, null=True)
    reason = models.CharField(max_length=256, null=True)

    @classmethod
    def create_and_save(cls, exception, func):
        error = RoyaleAPIError(
            clazz=exception.__class__,
            traceback=traceback.format_exc(),
            method=getattr(exception, 'method', None),
            refresh_method=func.__name__,
            data=getattr(exception, 'data', None),
            code=getattr(exception, 'code', None),
            reason=getattr(exception, 'reason', None)
        )
        error.save()
