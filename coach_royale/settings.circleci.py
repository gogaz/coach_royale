"""
Django settings for coach_royale project.

Generated by 'django-admin startproject' using Django 2.1.

For more information on this file, see
https://docs.djangoproject.com/en/2.1/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/2.1/ref/settings/
"""
import codecs
import os
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration
from sentry_sdk.integrations.celery import CeleryIntegration
from sentry_sdk.integrations.redis import RedisIntegration
from celery.schedules import crontab

from django.utils import timezone

# Hack to handle emojis under MySQL
codecs.register(lambda name: codecs.lookup('utf8') if name == 'utf8mb4' else None)

## Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

## SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'secret!'

## Clash Royale API configuration
CLASHROYALE_API_KEY = os.environ.get('CLASHROYALE_API_KEY') or "YOUR_API_KEY"
REFRESH_RATE = timezone.timedelta(minutes=5)
MAIN_CLAN = "2GJU9Y2G"  # omit the '#'

## SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

ALLOWED_HOSTS = ['127.0.0.1']

## Sentry SDK configuration - Optional
SENTRY_DSN = ""  # Replace with your sentry DSN in the form https://abcdef.ingest.sentry.io/1234
## Uncomment the following lines to enable Sentry
# sentry_sdk.init(
#     dsn=SENTRY_DSN,
#     integrations=[DjangoIntegration(), CeleryIntegration(), RedisIntegration()],
#
#     # If you wish to associate users to errors (assuming you are using
#     # django.contrib.auth) you may enable sending PII data.
#     send_default_pii=True
# )

## Database
# https://docs.djangoproject.com/en/2.1/ref/settings/#databases
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'coach_royale',
        'USER': 'coach_royale',
        'PASSWORD': '',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

TEST_RUNNER = 'xmlrunner.extra.djangotestrunner.XMLTestRunner'
TEST_OUTPUT_DIR = os.path.join('.', 'test-reports')

## Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'backend.apps.BackendConfig',
    'backend.apps.ClanRuleMatcherConfig',
    'rest_framework',
    'django_celery_results',
    'django_celery_beat',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': (
        'rest_framework.renderers.JSONRenderer',
    ),
    'DATETIME_FORMAT': "%Y-%m-%dT%H:%M:%S.%fZ",
}

ROOT_URLCONF = 'coach_royale.urls'

WSGI_APPLICATION = 'coach_royale.wsgi.application'

## Celery and Broker settings
CELERY_BROKER_URL = 'redis://redis:6379'
CELERY_BROKER_POOL_LIMIT = None
CELERY_BROKER_CONNECTION_TIMEOUT = 20
CELERY_BROKER_CONNECTION_RETRY = True
CELERY_BROKER_CONNECTION_MAX_RETRIES = 100
CELERY_TIMEZONE = 'UTC'
CELERY_ENABLE_UTC = True
CELERY_ACCEPT_CONTENT = ['json', 'pickle']
CELERY_RESULT_BACKEND = 'django-db'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TASK_RESULT_EXPIRES = 3600
CELERY_TASK_SERIALIZER = 'json'
# FIXME: move the schedule to another file, it should be easy to version
CELERY_BEAT_SCHEDULE = {
    'launcher': {
        'task': 'backend.tasks.refresh_launcher_job',
        'schedule': crontab('*/3')  # executes every 3 minutes
    },
    'refresh_constants': {
        'task': 'backend.tasks.refresh_constants_job',
        'schedule': crontab('0', '9')  # executes every day at 9AM UTC
    }
}

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [
            'venv/lib/site-packages/django/contrib/admin/templates',
            'backend/templates',
        ],
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'backend.context_processor.global_context',
            ],
        },
    },
]

# Password validation
# https://docs.djangoproject.com/en/2.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

APPEND_SLASH = False

# Internationalization
# https://docs.djangoproject.com/en/2.1/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/2.1/howto/static-files/

STATIC_URL = '/static/'
STATICFILES_DIRS = (
    os.path.join(BASE_DIR, 'static')
)

# Production values, comment when in development
X_FRAME_OPTIONS = 'DENY'
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
