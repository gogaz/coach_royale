from django.core.exceptions import ObjectDoesNotExist
from django.utils import timezone

from backend.lib.console_tools.command_helpers import command_print
from backend.models import (
    Battle,
    PlayerClanWar,
    Player,
    ClanWar,
    PlayerClanHistory,
    PlayerClanStatsHistory,
    ClanHistory,
    Clan
)


def refresh_clan_details(command, options, db_clan, api_client):
    """
    Used to refresh a single clan
    :param clashroyale.OfficialAPI api_client: The API client to request from
    :param BaseCommand command: The command it is executed from
    :param dict options: options passed to the command
    :param Clan|None db_clan: a clan record
    :return: False on error
    """

    if options['verbose']:
        command_print(command, "#INFO: Refreshing clan %s", db_clan.tag)

    clan = api_client.get_clan(db_clan.tag)

    clan_created = False
    track_clan = db_clan.refresh if db_clan else False
    if not db_clan.name:
        db_clan, clan_created = Clan.objects.get_or_create(tag=clan.tag[1:], defaults={'refresh': track_clan})
        if clan_created:
            db_clan.name = clan.name

    now = timezone.now()
    db_clan.last_refresh = now
    db_clan.save()

    try:
        previous_history = ClanHistory.objects.filter(clan=db_clan).order_by('-last_refresh')[0]
    except IndexError:
        previous_history = None

    db_clan_history, created = ClanHistory.create_or_find(
        clan=db_clan,
        score=clan.clan_score,
        trophies=clan.clan_war_trophies,
        required_trophies=clan.required_trophies,
        type=clan.type,
        description=clan.description,
        member_count=clan.members,
        donations=clan.donations_per_week,
        region=clan.location.name,
        region_code=clan.location.country_code,
        region_id=clan.location.id,
        badge=api_client.get_clan_image(clan)
    )
    db_clan_history.last_refresh = now
    if created:
        db_clan_history.timestamp = now

    if db_clan_history.highest_score is None or db_clan_history.highest_score < clan.clan_score:
        db_clan_history.highest_score = clan.score

    if previous_history:
        db_clan_history.highest_score = clan.clan_score if clan.clan_score > previous_history.highest_score else previous_history.highest_score
    else:
        db_clan_history.highest_score = clan.clan_score

    db_clan_history.save()
    read_clan_members(api_client, clan, db_clan, command, now, options['verbose'], clan_created)
    read_war_log(command, db_clan, api_client, options['verbose'])
    update_war_status(command, options, db_clan)
    read_clan_rank(command, db_clan, api_client, db_clan_history, verbose=options['verbose'])


def read_clan_members(api_client, clan, db_clan, command, now=timezone.now(), verbose=False, clan_created=False):
    # Read clan members
    read_players = []
    for player in clan.member_list:
        now = timezone.now()
        try:
            db_player = Player.objects.get(tag=player.tag[1:])
        except ObjectDoesNotExist:
            db_player = Player(tag=player.tag[1:], name=player.name)
            db_player.save()

        read_players.append(db_player.tag)
        last_seen = timezone.make_aware(api_client.get_datetime(player.last_seen, unix=False), timezone=timezone.utc)
        history_args = {
            "clan": db_clan,
            "player": db_player,
            "clan_role": player.role,
            "donations": player.donations,
            "donations_received": player.donations_received,
            "last_seen": last_seen,
        }
        db_player_clanstats, created = PlayerClanStatsHistory.create_or_find(**history_args)
        db_player_clanstats.current_clan_rank = player.clan_rank
        db_player_clanstats.previous_clan_rank = player.previous_clan_rank
        db_player_clanstats.trophies = player.trophies
        db_player_clanstats.level = player.exp_level
        db_player_clanstats.arena = int(str(player.arena.id)[2:])

        db_player_clanstats.last_refresh = now
        if created:
            db_player_clanstats.timestamp = now

        db_player_clanstats.save()

    # Refresh clan members
    actual_players = db_clan.get_players(now)
    if read_players or actual_players:
        for p in actual_players:
            if p.tag not in read_players:  # Player left clan
                pch = PlayerClanHistory.objects.get(player=p, clan=db_clan, left_clan__isnull=True)
                pch.left_clan = now
                pch.save()
                if verbose:
                    command_print(command, "#INFO: Player #%s left clan", p.tag)
        for tag in read_players:
            _p = [x for x in actual_players if x.tag == tag]
            if len(_p) == 0:  # Player joined clan
                player = Player.create_clan_history(tag, db_clan, clan_created, now=now)
                if verbose:
                    command_print(command, "#INFO: Player #%s joined clan", player.tag)


def read_war_log(command, db_clan: Clan, api_client, verbose=False):
    if verbose:
        command_print(command, "Refreshing ended wars")
    wars = api_client.get_clan_war_log(db_clan.tag)
    for war in wars:
        time = timezone.make_aware(api_client.get_datetime(war.created_date, unix=False), timezone=timezone.timezone.utc)
        db_war, created = ClanWar.objects.get_or_create(
            clan=db_clan,
            date_end__range=(time - timezone.timedelta(hours=12), time + timezone.timedelta(hours=12)),
            defaults=dict(date_end=time)
        )

        # We want to process the war if it hasn't already be processed, which means it was just created, or we don't
        #   have a start date (which is quite the same expectation) or if no players are associated with the war
        if created or db_war.date_start is None or PlayerClanWar.objects.filter(clan_war=db_war).count() == 0:
            db_war.participants = len(war.participants)
            for p in war.participants:
                db_p, _ = Player.objects.get_or_create(tag=p.tag[1:], defaults={'name': p.name})
                pcw, cpcw = PlayerClanWar.objects.get_or_create(clan_war=db_war, player=db_p)
                if cpcw:
                    pcw.final_battles = p.number_of_battles
                    pcw.final_battles_done = p.battles_played
                    pcw.final_battles_wins = p.wins
                    pcw.final_battles_misses = p.number_of_battles - p.battles_played
                    pcw.collections_cards_earned = p.cards_earned
                    pcw.collections_battles_done = p.collection_day_battles_played
                    pcw.save()

            position = 0
            while war.standings[position].clan.tag[1:] != db_clan.tag:
                position += 1
            war_results = war.standings[position].clan

            db_war.final_position = position + 1
            db_war.total_trophies = war_results.clan_score
            db_war.crowns = war_results.crowns
            db_war.wins = war_results.wins
            db_war.final_battles = war_results.battles_played
            db_war.losses = war_results.battles_played - war_results.wins
            db_war.season = war.season_id
            db_war.date_start = db_war.date_end - timezone.timedelta(days=2)
            db_war.save()


def update_war_status(command, options, db_clan):
    war_col_battles = db_clan.get_players_battles().filter(war__isnull=True, mode__collection_day=True).order_by('time')
    if options['verbose']:
        command_print(command, "Found %d collection battles to sort", war_col_battles.count())

    if war_col_battles.count():
        war = None
        for battle in war_col_battles:
            war = battle.get_war_for_collection_day(war)
            if war is None:
                continue
            battle.war = war
            battle.save()

    war_final_battles = db_clan.get_players_battles().filter(war__isnull=True, mode__war_day=True).order_by('time')
    if options['verbose']:
        command.stdout.write("Found %d war battles to sort" % war_final_battles.count())

    if war_final_battles.count():
        war = None
        for battle in war_final_battles:
            war = battle.get_war_for_final_day(db_clan, war)
            if war is None:
                continue
            battle.war = war
            battle.save()

    orphan_battles = Battle.objects.filter(war__isnull=True).order_by('time')
    if options['verbose']:
        command_print(command, "%d orphan battles found", orphan_battles.count())
    for b in orphan_battles.select_related('mode'):
        for p in b.team.all():
            clan = p.get_clan(b.time)
            if clan:
                war = b.get_war_for_collection_day(clan)
                if war is None:
                    continue
                b.war = war
                b.save()
                if options['verbose']:
                    command.stdout.write("found war for orphan battle")
                break


def read_clan_rank(command, db_clan: Clan, api_client, clan_stats: ClanHistory, verbose=False):
    # Top clans by trophies
    tops = read_top_ranks(api_client.get_top_clans(clan_stats.region_id), db_clan, clan_stats)
    if tops[0] is not None:
        clan_stats.local_rank = tops[0]
        clan_stats.prev_local_rank = tops[1]
        g_tops = read_top_ranks(api_client.get_top_clans(), db_clan, clan_stats)
        if g_tops[0] is not None:
            clan_stats.global_rank = g_tops[0]
            clan_stats.prev_global_rank = g_tops[1]
    elif verbose:
        command_print(command, "Clan #%s is not in rankings", db_clan.tag)

    # Top clans by war trophies
    war_tops = read_top_ranks(api_client.get_top_clanwar_clans(clan_stats.region_id), db_clan, clan_stats)
    if war_tops[0] is not None:
        clan_stats.local_war_rank = war_tops[0]
        clan_stats.prev_local_war_rank = tops[1]
        g_tops = read_top_ranks(api_client.get_top_clanwar_clans(), db_clan, clan_stats)
        if g_tops[0] is not None:
            clan_stats.global_war_rank = g_tops[0]
            clan_stats.prev_global_war_rank = g_tops[1]
    elif verbose:
        command_print(command, "Clan #%s is not in war rankings", db_clan.tag)

    # If we have a global rank, we do have a local rank
    if clan_stats.local_war_rank or clan_stats.local_rank:
        clan_stats.save()


def read_top_ranks(tops, db_clan, clan_stats):
    if tops[-1].clan_score > clan_stats.score:
        return None, None
    try:
        top = next(x for x in tops if x.tag[1:] == db_clan.tag)
    except StopIteration:
        return None, None
    return top.rank, top.previous_rank
