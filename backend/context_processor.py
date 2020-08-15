from django.conf import settings


def global_context(request):
    return {
        **settings.__dict__,
        'REFRESH_RATE': settings.REFRESH_RATE.total_seconds(),
    }
