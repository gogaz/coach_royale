FROM node:8

RUN mkdir -p /code/front
ADD package.json /code/front
ADD front/package-lock.json /code/front
RUN npm install -g npm@latest

WORKDIR /code/front
RUN npm install