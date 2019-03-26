FROM node:8

RUN npm install -g npm@latest

RUN mkdir -p /code
ADD package.json /code
ADD package-lock.json /code

WORKDIR /code
RUN npm install

ADD .babelrc /code
ADD webpack.common.js /code
ADD webpack.prod.js /code