from django.conf import settings
from django.utils.translation import get_language_from_request


def global_context(request):
    language = get_language_from_request(request)
    return {
        **settings.__dict__['_wrapped'].__dict__,
        'REFRESH_RATE': settings.REFRESH_RATE.total_seconds(),
        'REQUESTED_LANGUAGE': language,
    }
