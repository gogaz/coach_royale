from django.utils import timezone

from backend.models import (Player,
                            Clan,
                            PlayerClanHistory,
                            PlayerStatsHistory,
                            Card,
                            PlayerCardLevel,
                            Battle,
                            BattleMode, PlayerSeason, LeagueSeason)
from backend.lib.console_tools.command_helpers import command_print


def refresh_player_profile(command, options, db_player: Player, api_client):
    """
    Refresh a single user's profile

    :param clashroyale.OfficialAPI api_client: The API client to request from
    :param BaseCommand command: The command which is executed from (used to print)
    :param dict options: options passed to the command
    :param Player|None db_player: a player; if None, options['player'] must be set
    :return: False on APIError
    """
    if options['verbose']:
        command_print(command, "#INFO: Refreshing player #%s", db_player.tag)

    player = api_client.get_player(db_player.tag)

    now = timezone.now()

    if not db_player.name:
        db_player, created = Player.objects.get_or_create(tag=player.tag[1:], defaults={'refresh': db_player.refresh})
    db_player.name = player.name

    if player.clan is not None:
        player_clan = db_player.get_clan()
        # The following line avoids dealing with multiple clans in db when players leave focused clan
        # But this avoid fully refreshing a player who has refresh to True
        clan_created = player_clan is None
        if clan_created or not player_clan.refresh:
            player_clan, clan_created = Clan.objects.get_or_create(tag=player.clan.tag[1:], name=player.clan.name)
        db_player_clan, created = PlayerClanHistory.objects.get_or_create(player=db_player, left_clan__isnull=True)

        if created:
            db_player_clan.clan = player_clan
            if clan_created:
                db_player_clan.joined_clan = None
            else:
                db_player_clan.joined_clan = now
        elif db_player_clan.clan.tag != player.clan.tag[1:]:
            db_player_clan.left_clan = now
            db_player_clan.save()
            db_player_clan = PlayerClanHistory(player=db_player, left_clan=None, clan=player_clan)
            db_player_clan.clan = player_clan
            if clan_created:
                db_player_clan.joined_clan = None
            else:
                db_player_clan.joined_clan = now
            db_player_clan.save()
        else:
            pass

    query_fields = {
        'player': db_player,
        'level': player.exp_level,
        'total_donations': player.total_donations,
        'highest_trophies': player.best_trophies,
        'current_trophies': player.trophies,
        'challenge_cards_won': player.challenge_cards_won,
        'tourney_cards_won': player.tournament_cards_won,
        'cards_found': len(player.cards),
        'total_games': player.battle_count,
        'arena': int(str(player.arena.id)[2:]),
        'tournament_games': player.tournament_battle_count,
    }
    db_player_stats, created = PlayerStatsHistory.create_or_find(**query_fields)
    db_player_stats.favorite_card = Card.key_from_name(player.current_favourite_card.name)
    db_player_stats.win_3_crowns = player.three_crown_wins
    db_player_stats.draws = player.battle_count - player.wins - player.losses
    db_player_stats.losses = player.losses
    db_player_stats.wins = player.wins
    db_player_stats.clan_cards_collected = player.clan_cards_collected
    db_player_stats.war_day_wins = player.war_day_wins

    db_player_stats.last_refresh = now
    if created:
        db_player_stats.timestamp = now
    db_player_stats.save()

    # Player cards
    for card in player.cards:
        db_card = Card.instance_from_data(card)
        db_pcl, created = PlayerCardLevel.create_or_find(player=db_player, card=db_card)
        if db_pcl.count != card.count:
            db_pcl.count = card.count
        db_pcl.level = card.level
        db_pcl.count = card.count
        db_pcl.star_level = card.star_level if 'starLevel' in card.keys() else 0
        db_pcl.save()

    # Player battles
    if options['battles']:
        refresh_player_battles(command, api_client, db_player, **options)

    db_player.last_refresh = now
    db_player.save()

    # Player seasons (current & best seasons skipped)
    if player.league_statistics is not None and 'previousSeason' in player.league_statistics.keys():
        prev_season = player.league_statistics.previous_season
        db_season, _ = LeagueSeason.objects.get_or_create(identifier=prev_season.id, defaults={'timestamp': now})

        db_season, created = PlayerSeason.objects.get_or_create(
            player=db_player,
            season=db_season,
            defaults={
                'ending_rank': prev_season.rank if 'rank' in prev_season.keys() else None,
                'highest': prev_season.best_trophies if 'bestTrophies' in prev_season.keys() else prev_season.trophies,
                'ending': prev_season.trophies
            }
        )
    return True


def refresh_player_battles(command, api_client, db_player, **kwargs):
    verbose = kwargs.get('verbose')
    if verbose:
        command_print(command, "#INFO: Refreshing battles for player #%s", db_player.tag)
    battles = api_client.get_player_battles(db_player.tag)
    latest_battle = None
    try:
        latest_battle = Battle.objects.filter(team__id__exact=db_player.id).latest('time')
    except Battle.DoesNotExist:
        pass

    war_battles = []
    for b in sorted(battles, key=lambda x: x.utc_time):
        time = timezone.make_aware(api_client.get_datetime(b.battle_time, unix=False), timezone=timezone.utc)
        if latest_battle and time <= latest_battle.time:
            break
        else:
            # We only care about war battles, not all battles
            if b.type.startswith("clanWar"):
                war_battles.append((b, time))

    for b, time in war_battles:
        db_battle = Battle(time=time)

        try:
            mode = BattleMode.objects.get(name="War%s" % b.game_mode.name)
        except BattleMode.DoesNotExist:
            mode = BattleMode(name="War%s" % b.game_mode.name)
            mode.collection_day = True
            mode.card_levels = "Tournament"
            mode.same_deck = False
            mode.save()

        db_battle.mode = mode
        if b.arena:
            db_battle.arena = b.arena.name
        db_battle.opponent_crowns = sum([x.crowns for x in b.opponent])
        db_battle.team_crowns = sum([x.crowns for x in b.team])
        db_battle.team_size = len(b.team)
        win = db_battle.team_crowns > db_battle.opponent_crowns
        db_battle.win = win
        db_battle.save()

        if verbose:
            command_print(
                command,
                "     - Found %s battle ! %d-%d (%s)",
                "war" if mode.war_day else "collection " + b.mode.name,
                b.team_crowns,
                b.opponent_crowns,
                "win!" if win else "lose"
            )

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


def store_battle_players(db_player, team, players, save_decks=True):
    i = 0
    decks = [[], []]
    for p in players:
        if p.tag[1:] == db_player.tag:
            db_p = db_player
        else:
            db_p, created = Player.objects.get_or_create(tag=p.tag[1:], defaults={'name': p.name})
        team.add(db_p)
        if save_decks:
            for card in p.deck:
                c = Card.instance_from_data(card)
                decks[i].append(c)
        i += 1
    return decks
