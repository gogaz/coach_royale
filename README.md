Coach Royale
===


[![CircleCI branch](https://img.shields.io/circleci/project/github/gogaz/coach_royale/master.svg)](https://circleci.com/gh/gogaz/coach_royale/tree/master)
[![codecov](https://codecov.io/gh/gogaz/coach_royale/branch/master/graph/badge.svg)](https://codecov.io/gh/gogaz/coach_royale)
[![Requirements Status](https://requires.io/github/gogaz/coach_royale/requirements.svg?branch=master)](https://requires.io/github/gogaz/coach_royale/requirements/?branch=master) [![Greenkeeper badge](https://badges.greenkeeper.io/gogaz/coach_royale.svg)](https://greenkeeper.io/)

#### Django + React + Docker
Coach royale is a hobby project which consumes [RoyaleAPI](https://royaleapi.com) endpoints.

Setup
-----
#### Using Docker
First, you obviously need to [set up Docker on your system](https://docs.docker.com/install/).

Second, you need to copy `coach_royale/settings.example.py` to `coach_royale/settings.py` and adapt it to your needs.

Usage
-----
When Docker and Django are properly set up, all you have to do is
```
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build
```

By default the app is running on [localhost:8000](http://127.0.0.1:8000). You can change this behaviour by editing `docker-compose.yml`

When you are finished, you can stop the web server with `docker-compose down`.

### Have fun!
