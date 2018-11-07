FROM debian:stable

# Install global dependencies
RUN apt-get update && apt-get upgrade -y
RUN apt-get install -y python3-pip build-essential gunicorn3 cron
ENV PYTHONUNBUFFERED 1

# Install python dependencies
WORKDIR /code
RUN mkdir -p logs
ADD requirements.txt /code/
RUN pip3 install -r requirements.txt

# Setup cron jobs
ADD docker/crontab /etc/cron.d/coach_royale
RUN chmod 0644 /etc/cron.d/coach_royale
RUN crontab /etc/cron.d/coach_royale
CMD ["cron", "-f"]