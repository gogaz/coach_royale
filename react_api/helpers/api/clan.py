import datetime

from django.core.exceptions import ObjectDoesNotExist
from django.utils import timezone
from clashroyale import RoyaleAPI

from react_api.helpers.api.helpers import command_print
from react_api.models import (Battle,
                              PlayerClanWar,
                              Player,
                              ClanWar,
                              PlayerClanHistory,
                              PlayerClanStatsHistory,
                              ClanHistory,
                              Clan)
from react_api.repository import PlayerRepository, ClanRepository


def refresh_clan_details(command, options, db_clan, api_client):
    """
    Used to refresh a single clan
    :param clashroyale.RoyaleAPI api_client: The API client to request from
    :param BaseCommand command: The command it is executed from
    :param dict options: options passed to the command
    :param Clan|None db_clan: a clan
    :return: False on error
    """

    if options['verbose']:
        command_print(command, "#INFO: Refreshing clan %s (%s)", db_clan.name, db_clan.tag)

    clan = api_client.get_clan(db_clan.tag)

    clan_created = False
    if not db_clan.name:
        db_clan, clan_created = Clan.objects.get_or_create(tag=clan.tag, defaults={'refresh': db_clan.refresh})
        if clan_created:
            db_clan.name = clan.name
    now = timezone.now()
    db_clan.last_refresh = now
    db_clan.save()

    try:
        previous_history = ClanHistory.objects.filter(clan=db_clan).order_by('-last_refresh')[0]
    except IndexError:
        previous_history = None

    db_clan_history, created = ClanHistory.objects.get_or_create(clan=db_clan,
                                                                 score=clan.score,
                                                                 trophies=clan.war_trophies,
                                                                 required_trophies=clan.required_score,
                                                                 type=clan.type,
                                                                 description=clan.description,
                                                                 member_count=clan.member_count,
                                                                 donations=clan.donations,
                                                                 region=clan.location.name,
                                                                 region_code=clan.location.code,
                                                                 badge=clan.badge.image)
    db_clan_history.last_refresh = now
    if created:
        db_clan_history.timestamp = now

    if db_clan_history.highest_score is None or db_clan_history.highest_score < clan.score:
        db_clan_history.highest_score = clan.score

    if previous_history and previous_history.highest_score > db_clan_history.highest_score:
        db_clan_history.highest_score = previous_history.highest_score

    db_clan_history.save()

    read_clan_rank(command, db_clan, api_client, db_clan_history, verbose=options['verbose'])
    read_clan_members(clan, db_clan, command, now, options['verbose'], clan_created)
    read_war_log(command, db_clan, api_client, options['verbose'])


def read_clan_members(clan, db_clan, command, now=timezone.now(), verbose=False, clan_created=False):
    # Read clan members
    read_players = []
    for player in clan.members:
        now = timezone.now()

        try:
            db_player = Player.objects.get(tag=player.tag)
        except ObjectDoesNotExist:
            db_player = Player()
            db_player.tag = player.tag
            db_player.name = player.name
            db_player.save()

        read_players.append(db_player)
        db_player_clanstats, created = \
            PlayerClanStatsHistory.objects.get_or_create(clan=db_clan,
                                                         player=db_player,
                                                         clan_role=player.role,
                                                         donations=player.donations,
                                                         donations_received=player.donations_received)
        db_player_clanstats.current_clan_rank = player.rank
        db_player_clanstats.previous_clan_rank = player.get('previousRank')
        db_player_clanstats.trophies = player.trophies
        db_player_clanstats.level = player.exp_level
        db_player_clanstats.arena = player.arena.get('arenaID')

        db_player_clanstats.last_refresh = now
        if created:
            db_player_clanstats.timestamp = now

        db_player_clanstats.save()

    # Refresh clan members
    actual_members = ClanRepository.get_players_in_clan(db_clan)
    actual_players = [p.player for p in actual_members]
    if read_players:
        for i in range(len(actual_players)):
            pch = actual_members[i]
            p = actual_players[i]
            if p not in read_players:
                pch.left_clan = now
                pch.save()
                if verbose:
                    command_print(command, "#INFO: Player %s (%s) left clan", p.name, p.tag)
        for p in read_players:
            if p not in actual_players:
                db_player_clan, created = PlayerClanHistory.objects.get_or_create(player=p, left_clan__isnull=True)
                if created:
                    db_player_clan.clan = db_clan
                    db_player_clan.joined_clan = now
                else:
                    db_player_clan.left_clan = now
                    db_player_clan.save()
                    db_player_clan, created = PlayerClanHistory.objects.get_or_create(player=p, left_clan__isnull=True)
                    db_player_clan.clan = db_clan

                if clan_created:
                    db_player_clan.joined_clan = None
                else:
                    db_player_clan.joined_clan = now
                db_player_clan.save()
                if verbose:
                    command_print(command, "#INFO: Player %s (%s) joined clan", p.name, p.tag)


def read_war_log(command, db_clan: Clan, api_client, verbose=False):
    if verbose:
        command.stdout.write("Refreshing ended wars")
    wars = api_client.get_clan_war_log(db_clan.tag)
    for war in wars:
        time = datetime.datetime.fromtimestamp(war.created_date, tz=datetime.timezone.utc)
        db_war, created = ClanWar.objects.get_or_create(clan=db_clan,
                                                        date_start__range=(time, time + timezone.timedelta(hours=24)),
                                                        defaults={'date_start': time})
        if created or db_war.date_end is None or PlayerClanWar.objects.filter(clan_war=db_war).count() == 0:
            db_war.participants = len(war.participants)
            for p in war.participants:
                db_p, created = Player.objects.get_or_create(tag=p.tag, defaults={'name': p.name})
                pcw, cpcw = PlayerClanWar.objects.get_or_create(clan_war=db_war, player=db_p)
                if cpcw:
                    pcw.final_battles_done = p.battles_played
                    pcw.final_battles_wins = p.wins
                    pcw.collections_cards_earned = p.cards_earned
                    pcw.save()
            position = 0
            while war.standings[position].tag != db_clan.tag:
                position += 1
            war_results = war.standings[position]
            db_war.final_position = position + 1
            db_war.trophies = war_results.war_trophies_change
            db_war.total_trophies = war_results.war_trophies
            db_war.crowns = war_results.crowns
            db_war.wins = war_results.wins
            db_war.final_battles = war_results.battles_played
            db_war.losses = war_results.battles_played - war_results.wins
            db_war.season = war.season_number
            db_war.date_end = db_war.date_start + timezone.timedelta(hours=48)
            db_war.save()


def update_war_status(command, options, db_clan):
    war_col_battles = ClanRepository.get_players_battles_in_clan(db_clan).filter(war__isnull=True,
                                                                                 mode__collection_day=True) \
                                                                         .order_by('time')
    if options['verbose']:
        command.stdout.write("Found %d collection battles to sort" % war_col_battles.count())

    if war_col_battles.count():
        war = None
        for battle in war_col_battles:
            war = ClanRepository.get_war_for_collection_battle(db_clan, battle, war)
            if war is None:
                continue
            battle.war = war
            battle.save()

    war_final_battles = ClanRepository.get_players_battles_in_clan(db_clan).filter(war__isnull=True,
                                                                                   mode__war_day=True).order_by('time')
    if options['verbose']:
        command.stdout.write("Found %d war battles to sort" % war_final_battles.count())

    if war_final_battles.count():
        war = None
        for battle in war_final_battles:
            war = ClanRepository.get_war_for_final_battle(db_clan, battle, war)
            if war is None:
                continue
            battle.war = war
            battle.save()

    orphan_battles = Battle.objects.filter(war__isnull=True).order_by('time')
    if options['verbose']:
        command.stdout.write("%d orphan battles found" % orphan_battles.count())
    for b in orphan_battles.select_related('mode'):
        for p in b.team.all():
            clan = PlayerRepository.get_clan_for_player(p, b.time)
            if clan:
                war = ClanRepository.get_war_for_collection_battle(clan, b)
                b.war = war
                b.save()
                if options['verbose']:
                    command.stdout.write("found war for orphan battle")
                break


def read_clan_rank(command, db_clan: Clan, api_client: RoyaleAPI, clan_stats: ClanHistory, verbose=False):
    tops = read_top_ranks(command, api_client, db_clan, clan_stats, region_code=clan_stats.region_code, verbose=verbose)
    if tops[0] is not None:
        clan_stats.local_rank = tops[0]
        clan_stats.prev_local_rank = tops[1]
        g_tops = read_top_ranks(command, api_client, db_clan, clan_stats, verbose=verbose)
        if g_tops[0] is not None:
            clan_stats.global_rank = g_tops[0]
            clan_stats.prev_global_rank = g_tops[1]
        clan_stats.save()


def read_top_ranks(command, api_client, db_clan, clan_stats, region_code='', verbose=False):
    tops = api_client.get_top_clans(region_code)
    if tops[-1].score > clan_stats.score:
        if verbose:
            command_print(command, "Clan %s is not in %s ranking", db_clan.name, region_code)
        return None, None
    for top in tops:
        if top.tag == db_clan.tag:
            return top.rank, top.previous_rank
    return None, None
