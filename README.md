# Coach Royale


[![CircleCI branch](https://img.shields.io/circleci/project/github/gogaz/coach_royale/master.svg)](https://circleci.com/gh/gogaz/coach_royale/tree/master)
[![codecov](https://codecov.io/gh/gogaz/coach_royale/branch/master/graph/badge.svg)](https://codecov.io/gh/gogaz/coach_royale)
[![Requirements Status](https://requires.io/github/gogaz/coach_royale/requirements.svg?branch=master)](https://requires.io/github/gogaz/coach_royale/requirements/?branch=master)
[![Greenkeeper badge](https://badges.greenkeeper.io/gogaz/coach_royale.svg)](https://greenkeeper.io/)

#### Django + React + Docker
Coach royale is a hobby project which consumes [Clash Royale API](https://developer.clashroyale.com) endpoints.
This project used to support and rely on [RoyaleAPI](https://royaleapi.com), which is now discontinued, but was the first
and the best Clash Royale API.

[Demo](https://cycom.gogaz.org)

##Setup

#### Using Docker
First, you need to [set up Docker on your system](https://docs.docker.com/install/).

Second, clone the project, copy `coach_royale/settings.example.py` to `coach_royale/settings.py` and adapt it to your needs.


## Usage

When both Docker and Django are properly set up, all you have to do is run the following command in the root directory of the project
```
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build
```

By default the app is running on [localhost:8000](http://127.0.0.1:8000). You can change this behaviour by editing `docker-compose.yml`

When you are finished, you can stop the web server with `docker-compose down`.
### Update

1. Fetch the latest code by running `git pull`
1. check for changes in `settings.example.py` in the output of the above command
1. (if changes) `diff coach_royale/settings.example.py coach_royale/settings.py` and see if you want the changes
1. Re-build the image: `docker-compose -f docker-compose.prod.yml -f docker-compose.yml build backend`
1. You're done!
### Have fun!
