FROM node:10

RUN mkdir -p /code
ADD package.json /code
ADD yarn.lock /code

WORKDIR /code
RUN yarn install

ADD .babelrc /code
ADD webpack.common.js /code
ADD webpack.prod.js /code
ADD webpack.dev.js /code
