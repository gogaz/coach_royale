#!/bin/sh
WSGI_APPLICATION="coach_royale.wsgi:application"
DJANGO_HOST="0.0.0.0"
DJANGO_PORT=8000
LOG_FILE="/logs/gunicorn-error.log"

cd /code
yarn run build &
python manage.py migrate && \
  gunicorn $WSGI_APPLICATION --bind $DJANGO_HOST:$DJANGO_PORT --error-logfile $LOG_FILE