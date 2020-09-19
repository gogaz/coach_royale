import clashroyale
from django.conf import settings
from django.utils import timezone


class APIConsumer:
    LOG_LEVELS = [
        'DEBUG',
        'INFO',
        'WARN',
        'ERROR',
    ]

    def __init__(self, client=None, **options):
        """
        :param BaseCommand command: the command running this consumer
        :param str api_key: the key to connect to the API, settings used if none given
        :param options: additional options
        """
        self.client = client or clashroyale.OfficialAPI(settings.CLASHROYALE_API_KEY, timeout=60)
        self.verbose = options.pop('verbose', True)
        self._update_current_time()

    def get_datetime(self, datetime):
        return timezone.make_aware(
            self.client.get_datetime(datetime, unix=False),
            timezone=timezone.timezone.utc
        )

    def _update_current_time(self):
        """
        We may consume several API endpoints before actually saving a record in database, since we want to ignore this
        small delta, we fix the time and update it manually
        :return: None
        """
        self.now = timezone.now()

    def _log(self, message, level='INFO'):
        if level not in APIConsumer.LOG_LEVELS:
            err = "level {} not known, possible values are [{}]".format(level, ', '.join(APIConsumer.LOG_LEVELS))
            raise KeyError(err)

        message = "{}: {}".format(level, message)

        if not self.verbose:
            return

        print(message)

    def _get_last_from_database(self, cls, raise_error=True, **params):
        """
        Load the object with the highest id matching the given params and raise if none is found
        :param cls:
        :param params:
        :return:
        """
        try:
            return cls.objects.filter(**params).order_by('-id')[0]
        except IndexError as e:
            params_repr = ['{}: {}'.format(k, str(v)) for k, v in params.items()]
            msg = "No {} found with params {{{}}}".format(cls.__name__, params_repr)
            self._log(msg, 'ERROR' if raise_error else 'WARN')
            if raise_error:
                raise e
            else:
                return None
