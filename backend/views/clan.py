from django.conf import settings
from django.db import models
from django.db.models import Value, DateTimeField, IntegerField
from django.utils import timezone
from rest_framework.decorators import api_view
from rest_framework.response import Response

from backend.forms import DateRangeForm, WeekForm
from backend.lib.clan_rule_matcher.models import PlayerClanRuleGoal
from backend.lib.clan_rule_matcher.serializers import PlayerClanRuleSerializer, PlayerClanRuleGoalSerializer
from backend.models import Clan, PlayerClanStatsHistory, ClanWar, LeagueSeason
from backend.serializers.clan import (ClanWithDetailsSerializer,
                                      PlayerClanDetailsSerializer,
                                      PlayerInClanWarSerializer,
                                      ClanWarSerializer, PlayerWeeklyDonationsSerializer, PlayerClanSeasonSerializer)
from backend.serializers.misc import not_found_error, form_error
from backend.serializers.player import PlayerSerializer


@api_view(['GET'])
def clans_list(request):
    if request.method == 'GET':
        clans = Clan.objects.exclude(tag=settings.MAIN_CLAN).exclude(tag='').exclude(tag__isnull=True)
        if clans:
            family = clans.values_list('tag', flat=True)
        else:
            family = []
        return Response({'main': settings.MAIN_CLAN, 'family': family})


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
        players = clan.get_players()\
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
    players = clan.get_players()

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
    if form.is_valid():  # TODO: make this available from front-end
        now = form.cleaned_data['week']
    else:
        now = timezone.now()

    month = timezone.datetime.strptime("%s-W%s-1 03:00" % (now.year, now.isocalendar()[1]), "%Y-W%W-%w %H:%M")
    date = timezone.make_aware(month) - timezone.timedelta(weeks=1)
    players = clan.get_players(date).annotate(date=Value(date, output_field=DateTimeField()))
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
    players = clan.get_players(date).annotate(season_id=Value(season.id, output_field=IntegerField()))
    return Response(PlayerClanSeasonSerializer(players, many=True).data)


@api_view(['GET'])
def clan_role_change(request, tag):
    try:
        clan = Clan.objects.get(tag=tag)
    except Clan.DoesNotExist:
        return not_found_error("clan", tag)

    members = clan.get_current_players()
    db_clan_goals = PlayerClanRuleGoal.objects.filter(members, clan=clan)

    clan_goal_results = list()
    serialized_clan_goals = list()
    for goal in db_clan_goals:
        results = goal.execute_on(members)
        clan_goal_results.append({
            'goal_id': goal.id,
            'rules': PlayerClanRuleSerializer(results.keys()).data,
            'matching_players': [{rule.id: PlayerSerializer(player).data} for rule, player in results]
        })
        serialized_clan_goals.append(PlayerClanRuleGoalSerializer(goal))

    clan_goal_results = [{'goal_id': clan_goal.id, 'rules': clan_goal.execute_on(members)} for clan_goal in db_clan_goals]
    return Response({'goals': serialized_clan_goals, 'results': clan_goal_results})
