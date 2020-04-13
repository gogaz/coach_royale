import traceback

from django.db import models


class BaseError(models.Model):
    clazz = models.CharField(max_length=256, null=True)
    traceback = models.TextField(null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        abstract = True


class ObsoleteRoyaleAPIError(BaseError):
    method = models.CharField(max_length=128, null=True)
    refresh_method = models.CharField(max_length=256, null=True)
    data = models.TextField(null=True)
    code = models.CharField(max_length=64, null=True)
    reason = models.CharField(max_length=256, null=True)

    @classmethod
    def create(cls, exception, func):
        error = ObsoleteRoyaleAPIError(
            clazz=exception.__class__,
            traceback=traceback.format_exc(),
            method=getattr(exception, 'method', None),
            refresh_method=func.__name__,
            data=getattr(exception, 'data', None),
            code=getattr(exception, 'code', None),
            reason=getattr(exception, 'reason', None)
        )
        error.save()


class OfficialAPIError(BaseError):
    method = models.CharField(max_length=128, null=True)
    refresh_method = models.CharField(max_length=256, null=True)
    data = models.TextField(null=True)
    code = models.CharField(max_length=64, null=True)
    reason = models.CharField(max_length=256, null=True)

    @classmethod
    def create(cls, exception, func):
        error = OfficialAPIError(
            clazz=exception.__class__,
            traceback=traceback.format_exc(),
            method=getattr(exception, 'method', None),
            refresh_method=func.__name__,
            data=getattr(exception, 'data', None),
            code=getattr(exception, 'code', None),
            reason=getattr(exception, 'reason', None)
        )
        error.save()
