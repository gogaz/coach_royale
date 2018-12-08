FROM node:8

RUN mkdir -p /code
ADD package.json /code
ADD package-lock.json /code
RUN npm install -g npm@latest

WORKDIR /code
RUN npm install

# Copy files
ADD .babelrc /code
ADD webpack.config.js /code