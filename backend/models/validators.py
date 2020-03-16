import re
from django.core.validators import RegexValidator


def comma_separated_token_list_validator(sep=',', message=None, code='invalid'):
    regexp = re.compile(r'^[\w_-]+(?:%(sep)s[\w_-]+)*\Z' % {
        'sep': re.escape(sep),
    })
    return RegexValidator(regexp, message=message, code=code)


validate_comma_separated_token_list = comma_separated_token_list_validator(
    message='Enter only tokens ([\\w_-]+) separated by commas.'
)
