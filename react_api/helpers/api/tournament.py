import datetime

from clashroyale import StatusError, NotResponding
from django.utils import timezone

from react_api.models import Tournament, TournamentRefresh


def read_tournament(data, save=True):
    create_time = datetime.datetime.fromtimestamp(int(data.create_time), tz=datetime.timezone.utc)
    duration = datetime.timedelta(seconds=data.duration)
    prep_time = datetime.timedelta(seconds=data.prep_time)
    if not data.start_time:
        start_time = create_time + datetime.timedelta(seconds=data.prep_time)
    else:
        start_time = datetime.datetime.fromtimestamp(int(data.start_time), tz=datetime.timezone.utc)
    if not data.end_time:
        end_time = start_time + datetime.timedelta(seconds=data.duration)
    else:
        end_time = datetime.datetime.fromtimestamp(int(data.end_time), tz=datetime.timezone.utc)

    t, created = Tournament.objects.get_or_create(tag=data.tag, create_time=create_time, defaults={'open': data.open})
    t.tag = data.tag
    t.name = data.name
    t.max_players = data.max_players
    t.current_players = data.current_players
    t.status = data.status
    t.prep_time = prep_time
    t.start_time = start_time
    t.end_time = end_time
    t.duration = duration
    if save:
        t.save()
    return t, created


def refresh_open_tournaments(api_client, max=-1, **kwargs):
    refresh = TournamentRefresh(timestamp=timezone.now())
    page_total, current_page = 1, 0
    while page_total > 0 and max != 0:
        page_total = 0
        try:
            tournaments = api_client.get_open_tournaments(page=current_page)
        except NotResponding:
            refresh.error = "API not responding"
            refresh.success = False
        except StatusError as e:
            refresh.error = e.reason
            refresh.success = False
        else:
            refresh.success = True
            for tournament in tournaments:
                _, new = read_tournament(tournament)
                if new:
                    page_total += 1
            if page_total:
                refresh.count += page_total
        finally:
            max -= 1
            current_page += 1
    refresh.save()
    return refresh
