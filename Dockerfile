FROM python:3-alpine

# psycopg2 requirements
RUN apk add --no-cache --virtual .build-deps gcc git
RUN apk add --no-cache musl-dev postgresql-dev

# Install python dependencies
WORKDIR /code
RUN mkdir -p logs
ADD requirements.txt /code/
RUN pip install -r requirements.txt --no-cache-dir
RUN apk --purge del .build-deps

# Install node dependencies
RUN apk add yarn nodejs
ADD package.json /code
ADD yarn.lock /code
RUN yarn install

# Add config and binaries to container
ADD manage.py /code/
ADD tox.ini /code/

ADD .babelrc /code
ADD webpack.common.js /code
ADD webpack.prod.js /code
ADD webpack.dev.js /code

# Add aliases for Django commands
RUN printf '#!/bin/sh\npython /code/manage.py shell "$@"' >> /bin/console
RUN chmod +x /bin/console

RUN printf '#!/bin/sh\npython /code/manage.py makemigrations "$@"' >> /bin/makemigrations
RUN chmod +x /bin/makemigrations

RUN printf '#!/bin/sh\npython /code/manage.py migrate "$@"' >> /bin/migrate
RUN chmod +x /bin/migrate

# Prepare startup command
ADD ./docker/start-backend.sh /code/
RUN chmod +x /code/start-backend.sh
CMD /code/start-backend.sh