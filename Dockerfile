FROM debian:stable

# Install global dependencies
RUN apt-get update && apt-get upgrade -y
RUN apt-get install -y python3-pip build-essential gunicorn3 git
RUN ln -s /usr/bin/python3 /usr/bin/py
RUN ln -s /usr/bin/python3 /usr/bin/python
RUN ln -s /usr/bin/pip3 /usr/bin/pip
ENV PYTHONUNBUFFERED 1

# Install python dependencies
WORKDIR /code
RUN mkdir -p logs
ADD requirements.txt /code/
RUN pip3 install -r requirements.txt

CMD ["/bin/bash"]