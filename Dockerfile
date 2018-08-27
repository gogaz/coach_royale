FROM ubuntu:18.04

# Install global dependencies
RUN apt-get update && apt-get upgrade
RUN apt-get install -y python3-pip build-essential npm gunicorn3
ENV PYTHONUNBUFFERED 1

# Install python dependencies
WORKDIR /code
ADD requirements.txt /code/
RUN pip3 install -r requirements.txt
ADD . /code/

# Build the front
WORKDIR /code/front
RUN npm install -g npm@latest
RUN npm install
RUN npm run-script build

WORKDIR /code