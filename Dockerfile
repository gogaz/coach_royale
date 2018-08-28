FROM ubuntu:18.04

# Install global dependencies
RUN apt-get update && apt-get upgrade
RUN apt-get install -y python3-pip build-essential gunicorn3 npm
ENV PYTHONUNBUFFERED 1

# Install python dependencies
WORKDIR /code
ADD requirements.txt /code/
RUN pip3 install -r requirements.txt