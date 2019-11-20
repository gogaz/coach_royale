from django.conf import settings


def global_context(request):
    return {
        'REFRESH_RATE': settings.REFRESH_RATE.total_seconds(),
        'MAIN_CLAN': settings.MAIN_CLAN
    }
