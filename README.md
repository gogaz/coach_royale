Coach Royale
===


[![CircleCI branch](https://img.shields.io/circleci/project/github/gogaz/coach_royale/master.svg)](https://circleci.com/gh/gogaz/coach_royale/tree/master)
[![codecov](https://codecov.io/gh/gogaz/coach_royale/branch/master/graph/badge.svg)](https://codecov.io/gh/gogaz/coach_royale)
[![Requirements Status](https://requires.io/github/gogaz/coach_royale/requirements.svg?branch=master)](https://requires.io/github/gogaz/coach_royale/requirements/?branch=master) [![Greenkeeper badge](https://badges.greenkeeper.io/gogaz/coach_royale.svg)](https://greenkeeper.io/)

#### Django + React + Docker
Coach royale is a hobby project which consumes [RoyaleAPI](https://royaleapi.com) endpoints.

Installation
----
#### Using Docker
First, you obviously need to [set up Docker on your system](https://docs.docker.com/install/).

Second, you need to copy `coach_royale/settings.example.py` to `coach_royale/settings.py` and adapt it to your needs.

When Docker and Django are properly set up, all you have to do is
```
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up
```

#### Without Docker
You will need :
 - Python3 (preferably version 3.6+)
 - nodejs 8+ with npm

You have to setup and build the front-end. First, browse to the `front` folder, then run following commands:
1. `npm install`
3. `npm run build`

You also need to setup Django and install Python dependencies:
1. `virtualenv .`
1. `pip install -r requirements.txt`
1. copy `coach_royale/settings.example.py` to `coach_royale/settings.py` and adapt it to your needs

You're all set ! In order for the application to be viewable, you need to launch the web server:
`gunicorn3 coach_royale.wsgi:application --bind 127.0.0.1:8000`

#### Access the app
Coach Royale, by default, is running on [localhost:8000](http://127.0.0.1:8000).

When you are finished, you can stop the web server with `Ctrl-C`, either way.

### Have fun!
