import datetime

from django.core.exceptions import ObjectDoesNotExist
from django.utils import timezone

from react_api.models import (Player,
                              Clan,
                              PlayerClanHistory,
                              PlayerStatsHistory,
                              Card,
                              PlayerCardLevel,
                              Battle,
                              BattleMode, PlayerSeason, LeagueSeason)
from react_api.repository import PlayerRepository
from .helpers import command_print, store_battle_players


def refresh_player_profile(command, options, db_player: Player, api_client):
    """
    Refresh a single user's profile

    :param clashroyale.RoyaleAPI api_client: The API client to request from
    :param BaseCommand command: The command which is executed from (used to print)
    :param dict options: options passed to the command
    :param Player|None db_player: a player; if None, options['player'] must be set
    :return: False on APIError
    """
    if options['verbose']:
        command_print(command, "#INFO: Refreshing player %s (#%s)", db_player.name if db_player.name else '', db_player.tag)

    player = api_client.get_player(db_player.tag)

    now = timezone.now()

    if not db_player.name:
        db_player, created = Player.objects.get_or_create(tag=player.tag, defaults={'refresh': db_player.refresh})
    db_player.name = player.name

    if player.clan is not None:
        player_clan = PlayerRepository.get_clan_for_player(db_player)
        clan_created = player_clan is None
        # This avoid dealing with multiple clans in db when players leave focused clan
        # But this avoid fully refreshing a player who has refresh to True
        if clan_created or not player_clan.refresh:
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
    db_player_stats.favorite_card = player.stats.favorite_card.key
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
        refresh_player_battles(command, options, api_client, db_player, False)

    db_player.last_refresh = now
    db_player.save()

    # Player seasons (current & best seasons skipped)
    if player.league_statistics is not None and 'previousSeason' in player.league_statistics.keys():
        prev_season = player.league_statistics.previous_season
        db_season, s_created = LeagueSeason.objects.get_or_create(identifier=prev_season.id, defaults={'timestamp': now})

        db_season, created = PlayerSeason.objects.get_or_create(player=db_player,
                                                                season=db_season,
                                                                defaults={
                                                                    'ending_rank': prev_season.rank if 'rank' in prev_season.keys() else None,
                                                                    'highest': prev_season.best_trophies if 'bestTrophies' in prev_season.keys() else prev_season.trophies,
                                                                    'ending': prev_season.trophies,
                                                                }
                                                                )
    return True


def refresh_player_battles(command, options, api_client, db_player, announce_player=True):
    if announce_player:
        try:
            command_print(command, "#INFO: Refreshing battles for player (%s) %s", db_player.name, db_player.tag)
        except:
            command_print(command, "#INFO: Refreshing battles for player %s", db_player.tag)
    battles = api_client.get_player_battles(db_player.tag)
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

            opponent_decks = store_battle_players(db_player, db_battle.team, b.opponent)
            for card in opponent_decks[0]:
                db_battle.opponent_deck.add(card)
            for card in opponent_decks[1]:
                db_battle.opponent_team_deck.add(card)
        else:
            store_battle_players(db_player, db_battle.team, b.team, False)
            store_battle_players(db_player, db_battle.opponent, b.opponent, False)
