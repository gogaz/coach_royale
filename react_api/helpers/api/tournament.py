from clashroyale import StatusError, NotResponding
from django.db import IntegrityError
from django.utils import timezone

from react_api.models import Tournament, JoinableTournamentRefresh


def read_tournament(data, save=True):
    t = Tournament(tag=data.tag,
                   name=data.name,
                   open=data.open,
                   max_players=data.max_players,
                   current_players=data.current_players,
                   status=data.status,
                   create_time=data.create_time,
                   prep_time=data.prep_time,
                   start_time=data.start_time,
                   end_time=data.end_time,
                   duration=data.duration)
    if save:
        try:
            t.save()
        except IntegrityError:
            pass
    return t


def refresh_joinable_tournaments(api_client):
    refresh = JoinableTournamentRefresh(timestamp=timezone.now())
    try:
        tournaments = api_client.get_joinable_tournaments()
    except NotResponding:
        refresh.error = "Not responding"
        refresh.success = False
    except StatusError as e:
        refresh.error = e.reason
        refresh.success = False
    else:
        refresh.success = True
        for tournament in tournaments:
            read_tournament(tournament)
    finally:
        refresh.save()
