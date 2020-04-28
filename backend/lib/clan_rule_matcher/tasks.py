from celery import shared_task


@shared_task
def do_nothing():
    print('doing nothing')
