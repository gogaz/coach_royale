import datetime

from clashroyale import StatusError, NotResponding
from django.utils import timezone

from react_api.models import Tournament, OpenTournamentRefresh


def read_tournament(data, save=True):
    data.create_time = datetime.datetime.fromtimestamp(data.create_time, tz=datetime.timezone.utc)
    if not data.start_time:
        data.start_time = data.create_time + datetime.timedelta(seconds=data.prep_time)
    if not data.end_time:
        data.end_time = data.start_time + datetime.timedelta(seconds=data.duration)

    t, created = Tournament.objects.get_or_create(tag=data.tag, create_time=data.create_time, defaults={'open': data.open})
    t.tag = data.tag
    t.name = data.name
    t.max_players = data.max_players
    t.current_players = data.current_players
    t.status = data.status
    t.prep_time = datetime.timedelta(seconds=data.prep_time)
    t.start_time = data.start_time
    t.end_time = data.end_time
    t.duration = datetime.timedelta(seconds=data.duration)
    if save:
        t.save()
    return t, created


def refresh_open_tournaments(command, options, api_client):
    refresh = OpenTournamentRefresh(timestamp=timezone.now())
    max = -1
    if options['max']:
        max = options['max']
    total = 0
    page_total = 1
    while page_total > 0 and max != 0:
        page_total = 0
        try:
            tournaments = api_client.get_open_tournaments(page=options['open'])
        except NotResponding:
            refresh.error = "Not responding"
            refresh.success = False
            if options['verbose']:
                command.stderr.write("#ERR: API not responding")
        except StatusError as e:
            refresh.error = e.reason
            refresh.success = False
            if options['verbose']:
                command.stderr.write("#ERR: %s" % e.reason)
        else:
            refresh.success = True
            for tournament in tournaments:
                _, new = read_tournament(tournament)
                if new:
                    total += 1
                    page_total += 1
            if options['verbose']:
                command.stdout.write("#INFO: Read %d new tournaments " % page_total)
        finally:
            refresh.save()
            Tournament.objects.filter(end_time__lte=timezone.now()).delete()
            max -= 1
    if options['verbose']:
        command.stdout.write("#INFO: Read %d new tournaments total" % total)
