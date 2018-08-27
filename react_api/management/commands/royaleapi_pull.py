import datetime
import sys, os

import clashroyale
from box import BoxKeyError
from django.core.management import BaseCommand
from django.db.models import Q, ObjectDoesNotExist
from django.utils import timezone

from django.conf import settings
from react_api.models import *
from react_api.repository import ClanRepository, PlayerRepository

APIClient = clashroyale.RoyaleAPI(settings.ROYALE_API_KEY, timeout=30)


class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument('--verbose', action='store_true', help="enable verbose mode")
        parser.add_argument('--clan', type=str, help="add clan tag to database and enable auto-refresh")
        parser.add_argument('--player', type=str, help="add player tag to database and enable auto-refresh")
        parser.add_argument('--force', action='store_true', help="Force update without taking care of last refresh")
        parser.add_argument('--battles', action='store_true', help="Refresh player battles (unstable)")

    def handle(self, *args, **options):
        db_clans = Clan.objects.filter(refresh=True)
        if not options['force']:
            db_clans = db_clans.filter(Q(last_refresh__lte=timezone.now() - timezone.timedelta(minutes=60)) | Q(last_refresh__isnull=True))

        run_refresh_method(self, options, refresh_clan_details, db_clans)
        if options['clan']:
            run_refresh_method(self, options, refresh_clan_details, [None])

        db_players = Player.objects.filter((Q(refresh=True) | Q(playerclanhistory__clan__refresh=True, playerclanhistory__left_clan__isnull=True)))
        if not options['force']:
            db_players = db_players.filter(Q(last_refresh__lte=timezone.now() - timezone.timedelta(minutes=60)) | Q(last_refresh__isnull=True))

        run_refresh_method(self, options, refresh_player_profile, db_players.order_by('last_refresh'))

        if options['player']:
            run_refresh_method(self, options, refresh_player_profile, [None])


def run_refresh_method(command, options, func, iterable, depth=3):
    if depth <= 0:
        return
    failed = []
    for i in iterable:
        if i is None:
            if options['clan']:
                i = Clan(tag=options['clan'])
            elif options['player']:
                i = Player(tag=options['player'])
            else:
                exit_with_failure(command)
            i.refresh = True
        try:
            func(command, options, i)
        except clashroyale.NotResponding:
            if isinstance(i, Clan):
                command.stderr.write("#ERROR: Request timed out while fetching data for clan %s (#%s)" % (i.name, i.tag))
            elif isinstance(i, Player):
                command.stderr.write("#ERROR: Request timed out while fetching data for player %s (#%s)" % (i.name, i.tag))
            else:
                command.stderr.write("#ERROR: Request timed out while fetching data for #" + str(i))
            failed.append(i)
        except clashroyale.ServerError:
            pass

    run_refresh_method(command, options, func, failed, depth - 1)


def store_battle_players(db_player, team, players, save_decks=True):
    i = 0
    decks = [[], []]
    for p in players:
        if p.tag == db_player.tag:
            db_p = db_player
        else:
            db_p, created = Player.objects.get_or_create(tag=p.tag, defaults={'name': p.name})
        team.add(db_p)
        if save_decks:
            for card in p.deck:
                fc = Card.instance_from_data(card)
                decks[i].append(fc)
        i += 1
    return decks


def refresh_player_profile(command, options, db_player):
    """
    Refreshes a single user profile
    :param BaseCommand command: The command which is executed from (used to print)
    :param dict options: options passed to the command
    :param Player|None db_player: a player; if None, options['player'] must be set
    :return: False on APIError
    """
    if options['verbose']:
        command_print(command, "#INFO: Refreshing player %s (#%s)", db_player.name, db_player.tag)

    player = APIClient.get_player(db_player.tag)

    now = timezone.now()

    if not db_player.name:
        db_player, created = Player.objects.get_or_create(tag=player.tag)
    db_player.name = player.name

    if player.clan is not None:
        player_clan, clan_created = Clan.objects.get_or_create(tag=player.clan.tag, name=player.clan.name)
        db_player_clan, created = PlayerClanHistory.objects.get_or_create(player=db_player, left_clan__isnull=True)

        if created:
            db_player_clan.clan = player_clan
            if clan_created:
                db_player_clan.joined_clan = None
            else:
                db_player_clan.joined_clan = now
        elif db_player_clan.clan.tag != player.clan.tag:
            db_player_clan.left_clan = now
            db_player_clan.save()
            db_player_clan = PlayerClanHistory(player=db_player, left_clan__isnull=True, clan=player_clan)
            db_player_clan.clan = player_clan
            if clan_created:
                db_player_clan.joined_clan = None
            else:
                db_player_clan.joined_clan = now
            db_player_clan.save()
        else:
            pass

    db_player_stats, created = PlayerStatsHistory.objects.get_or_create(player=db_player,
                                                                        level=player.stats.level,
                                                                        total_donations=player.stats.total_donations,
                                                                        highest_trophies=player.stats.max_trophies,
                                                                        current_trophies=player.trophies,
                                                                        cards_found=player.stats.cards_found,
                                                                        total_games=player.games.total,
                                                                        arena=player.arena.arena_id)
    db_player_stats.tourney_cards_won = player.stats.tournament_cards_won
    db_player_stats.challenge_cards_won = player.stats.challenge_cards_won
    Card.instance_from_data(player.stats.favorite_card)
    try:
        db_player_stats.favorite_card = player.stats.favorite_card.key
    except BoxKeyError:
        pass
    db_player_stats.tournament_games = player.games.tournament_games
    db_player_stats.win_3_crowns = player.stats.three_crown_wins
    db_player_stats.draws = player.games.draws
    db_player_stats.losses = player.games.losses
    db_player_stats.wins = player.games.wins
    db_player_stats.clan_cards_collected = player.stats.clan_cards_collected
    db_player_stats.war_day_wins = player.games.war_day_wins

    db_player_stats.last_refresh = now
    if created:
        db_player_stats.timestamp = now
    db_player_stats.save()

    # Player cards
    for card in player.cards:
        try:
            db_card = Card.instance_from_data(card)
            db_pcl, created = PlayerCardLevel.objects.get_or_create(player=db_player, card=db_card)
            if db_pcl.count != card.count:
                db_pcl.count = card.count
            db_pcl.level = card.level
            db_pcl.save()
        except:
            pass

    # Player battles
    if options['battles']:
        refresh_player_battles(command, options, db_player, False)

    db_player.last_refresh = now
    db_player.save()
    return True


def refresh_player_battles(command, options, db_player, announce_player=True):
    if announce_player:
        try:
            command_print(command, "#INFO: Refreshing battles for player (%s) %s", db_player.name, db_player.tag)
        except:
            command.stdout.write("#INFO: Refreshing battles for player %s" % db_player.tag)
    battles = APIClient.get_player_battles(db_player.tag)
    latest_battle = None
    try:
        latest_battle = Battle.objects.filter(team__id__exact=db_player.id).latest('time')
    except ObjectDoesNotExist:
        pass

    war_battles = []
    for b in sorted(battles, key=lambda x: x.utc_time):
        time = datetime.datetime.fromtimestamp(b.utc_time, tz=datetime.timezone.utc)
        if latest_battle and time <= latest_battle.time:
            break
        else:
            # new_battles.append((b, time))
            if b.type.startswith("clanWar"):
                war_battles.append((b, time))
    for b, time in war_battles:
        db_battle = Battle()
        db_battle.time = time
        try:
            mode = BattleMode.objects.get(name="War%s" % b.mode.name)
        except ObjectDoesNotExist:
            mode = BattleMode(name="War%s" % b.mode.name)
            mode.collection_day = True
            mode.card_levels = "Tournament"
            mode.same_deck = False
            mode.save()

        win = b.team_crowns > b.opponent_crowns
        db_battle.mode = mode
        db_battle.arena = b.arena.name
        db_battle.opponent_crowns = b.opponent_crowns
        db_battle.team_crowns = b.team_crowns
        db_battle.team_size = b.team_size
        db_battle.win = win
        db_battle.save()

        if options['verbose']:
            command.stdout.write("     - Found %s battle ! %d-%d (%s)" % ("war" if mode.war_day else "collection " + b.mode.name,
                                                                          b.team_crowns,
                                                                          b.opponent_crowns,
                                                                          "win!" if win else "lose"))

        if mode.war_day:
            team_decks = store_battle_players(db_player, db_battle.team, b.team)
            for card in team_decks[0]:
                db_battle.player_deck.add(card)
            for card in team_decks[1]:
                db_battle.team_deck.add(card)

            oppononet_decks = store_battle_players(db_player, db_battle.team, b.opponent)
            for card in oppononet_decks[0]:
                db_battle.opponent_deck.add(card)
            for card in oppononet_decks[1]:
                db_battle.opponent_team_deck.add(card)
        else:
            store_battle_players(db_player, db_battle.team, b.team, False)
            store_battle_players(db_player, db_battle.opponent, b.opponent, False)


def refresh_clan_details(command, options, db_clan):
    """
    Used to refresh a single clan
    :param BaseCommand command: The command it is executed from
    :param dict options: options passed to the command
    :param Clan|None db_clan: a clan
    :return: False on error
    """
    if options['verbose']:
        if db_clan:
            command_print(command, "#INFO: Refreshing clan %s (%s)", db_clan.name, db_clan.tag)
        else:
            command.stdout.write("#INFO: Refreshing new clan %s" % options['clan'])

    clan = APIClient.get_clan(db_clan.tag)

    clan_created = False
    if not db_clan.name:
        db_clan, clan_created = Clan.objects.get_or_create(tag=clan.tag)
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
                                                                 required_trophies=clan.required_score,
                                                                 type=clan.type,
                                                                 description=clan.description,
                                                                 member_count=clan.member_count,
                                                                 donations=clan.donations,
                                                                 region=clan.location.name,
                                                                 badge=clan.badge.image)
    db_clan_history.last_refresh = now
    if created:
        db_clan_history.timestamp = now

    if db_clan_history.highest_score is None or db_clan_history.highest_score < clan.score:
        db_clan_history.highest_score = clan.score

    if previous_history and previous_history.highest_score > db_clan_history.highest_score:
        db_clan_history.highest_score = previous_history.highest_score

    db_clan_history.save()

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
        db_player_clanstats, created = PlayerClanStatsHistory.objects.get_or_create(clan=db_clan,
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
                if options['verbose']:
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
                if options['verbose']:
                    command_print(command, "#INFO: Player %s (%s) joined clan", p.name, p.tag)

    if options['verbose']:
        command.stdout.write("Refreshing ended wars")
    wars = APIClient.get_clan_war_log(db_clan.tag)
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
            db_war.crowns = war_results.crowns
            db_war.wins = war_results.wins
            db_war.final_battles = war_results.battles_played
            db_war.losses = war_results.battles_played - war_results.wins
            db_war.season = war.season_number
            db_war.date_end = db_war.date_start + timezone.timedelta(hours=48)
            db_war.save()

    return True


def update_war_status(command, options, db_clan):
    war_col_battles = ClanRepository.get_players_battles_in_clan(db_clan).filter(war__isnull=True,
                                                                                 mode__collection_day=True).order_by('time')
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


    # wars = ClanWar.objects.filter(clan=db_clan, date_end__isnull=True, date_start__lte=timezone.now() - timezone.timedelta(hours=48))
    # for war in wars:
    #     battles = Battle.objects.filter(war=war)
    #     war.participants = ClanRepository.get_players_in_clan_2(db_clan, war.date_start).filter(team__war=war).distinct().count()
    #     war.final_battles = battles.filter(mode__war_day=True).count()
    #     war.collections_battles = battles.filter(mode__collection_day=True).count()
    #     war.wins = battles.filter(mode__war_day=True, win=True).count()
    #     war.losses = battles.filter(mode__war_day=True, win=False).count()
    #     war.crowns = battles.filter(mode__war_day=True).aggregate(Sum('team_crowns'))['team_crowns__sum']
    #     latest_final_battle = battles.filter(mode__war_day=True).order_by('-time')
    #     if latest_final_battle.count():
    #         war.date_end = latest_final_battle[0].time
    #     war.save()


def exit_with_failure(command):
    command.stderr.write("Please use --help")
    sys.exit(1)


def command_print(command, string: str, *args):
    _args = []
    for i in range(len(args)):
        if not args[i]:
            _args.append('???')
        else:
            _args.append(args[i])
    output = string % tuple(_args)
    command.stdout.write(output)
