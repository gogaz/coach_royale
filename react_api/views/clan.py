from django.conf import settings
from django.db import models
from django.db.models import Value, DateTimeField, IntegerField
from django.utils import timezone
from rest_framework.decorators import api_view
from rest_framework.response import Response

from react_api.forms import DateRangeForm, WeekForm
from react_api.models import Clan, PlayerClanStatsHistory, ClanWar, LeagueSeason
from react_api.repository import ClanRepository
from react_api.serializers.clan import (ClanWithDetailsSerializer,
                                        PlayerClanDetailsSerializer,
                                        PlayerInClanWarSerializer,
                                        ClanWarSerializer, PlayerWeeklyDonationsSerializer, PlayerClanSeasonSerializer)
from react_api.serializers.misc import not_found_error, form_error


@api_view(['GET'])
def clans_list(request):
    if request.method == 'GET':
        try:
            main_clan = Clan.objects.get(tag=settings.MAIN_CLAN)
        except Clan.DoesNotExist:
            return not_found_error("clan", "main")
        clans = Clan.objects.exclude(tag=settings.MAIN_CLAN)
        if clans:
            family = ClanWithDetailsSerializer(clans, many=True).data
        else:
            family = []
        return Response({'main': ClanWithDetailsSerializer(main_clan, allow_null=True).data, 'family': family})


@api_view(['GET'])
def clan_info(request, tag):
    if request.method == 'GET':
        try:
            clan = Clan.objects.get(tag=tag)
        except Clan.DoesNotExist:
            return not_found_error("clan", tag)

        serializer = ClanWithDetailsSerializer(clan)
        return Response(serializer.data)


@api_view(['GET'])
def clan_members(request, tag):
    try:
        clan = Clan.objects.get(tag=tag)
    except Clan.DoesNotExist:
        return not_found_error("clan", tag)

    if request.method == 'GET':
        latest_stats_history_pks = PlayerClanStatsHistory.objects.values('player')\
            .annotate(max_id=models.Max('id')).values_list('max_id', flat=True)
        players = ClanRepository.get_players_in_clan(clan)\
            .prefetch_related(models.Prefetch('playerstatshistory_set',
                                              queryset=PlayerClanStatsHistory.objects.filter(pk__in=latest_stats_history_pks),
                                              to_attr='last_stat_list'))
        serializer = PlayerClanDetailsSerializer(players, many=True)
        return Response(serializer.data)


@api_view(['GET', 'POST'])
def clan_wars(request, tag):
    try:
        clan = Clan.objects.get(tag=tag)
    except Clan.DoesNotExist:
        return not_found_error("clan", tag)

    wars = ClanWar.objects.filter(clan=clan).order_by('-date_start')
    players = ClanRepository.get_players_in_clan(clan)

    form = DateRangeForm(request.POST)
    if form.is_valid():
        range_start = form.cleaned_data["start"]
        range_end = form.cleaned_data["end"]
        wars = wars.filter(date_start__gte=range_start, date_start__lte=range_end)
    else:
        wars = wars[:10]

    if request.method == "POST" and not form.is_valid():
        return form_error(form)

    wars_json = ClanWarSerializer(wars, many=True)
    players_json = PlayerInClanWarSerializer(players, wars=wars, many=True)

    return Response({'wars': wars_json.data, 'members': players_json.data})


@api_view(['GET', 'POST'])
def clan_weekly_season(request, tag):
    try:
        clan = Clan.objects.get(tag=tag)
    except Clan.DoesNotExist:
        return not_found_error("clan", tag)

    form = WeekForm(request.POST)
    if form.is_valid(): # TODO: make this available from front-end
        now = form.cleaned_data['week']
    else:
        now = timezone.now()

    month = "%s-W%s-1 07:00" % (now.year, now.isocalendar()[1])
    date = timezone.make_aware(timezone.datetime.strptime(month, "%Y-W%W-%w %H:%M")) - timezone.timedelta(weeks=1)
    players = ClanRepository.get_players_in_clan(clan, date).annotate(date=Value(date, output_field=DateTimeField()))
    serializer = PlayerWeeklyDonationsSerializer(players, many=True)
    return Response(serializer.data)


@api_view(['GET', 'POST'])
def clan_monthly_season(request, tag):
    try:
        clan = Clan.objects.get(tag=tag)
    except Clan.DoesNotExist:
        return not_found_error("clan", tag)

    season = LeagueSeason.objects.order_by('-id').first()
    month = "%s-1 07:00" % season.identifier
    date = timezone.make_aware(timezone.datetime.strptime(month, "%Y-%W-%w %H:%M")) - timezone.timedelta(weeks=1)
    players = ClanRepository.get_players_in_clan(clan, date).annotate(season_id=Value(season.id, output_field=IntegerField()))
    return Response(PlayerClanSeasonSerializer(players, many=True).data)
