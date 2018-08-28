FROM node:8

RUN mkdir -p /code/front
ADD package.json /code/front

WORKDIR /code/front
RUN npm install -g npm@latest
RUN npm install