from django.utils import timezone

from backend.models import (
    Player,
    Clan,
    PlayerClanHistory,
    PlayerStatsHistory,
    Card,
    PlayerCardLevel,
    Battle,
    BattleMode,
    PlayerSeason,
    LeagueSeason
)

from .base import APIConsumer as BaseConsumer


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


class APIConsumer(BaseConsumer):
    def read_player(self, tag, keep_now=False):
        """
        Read a single player given the tag
        :param str tag: player tag without the initial #
        :param bool keep_now: whether self.now should be updated or not
        :return: None
        """
        if not keep_now:
            self._update_current_time()

        player = self.client.get_player(tag)
        db_player, created = Player.objects.get_or_create(tag=tag, defaults={'name': player.name})

        self._log("Refreshing clan for player #%s" % tag)
        self.read_player_clan(db_player, player=player)
        self._log("Refreshing player #%s" % tag)
        self.read_player_stats(db_player, player)
        self.read_player_cards(db_player, player.cards)
        self._log("Refreshing battles for player #%s" % db_player.tag)
        self.read_player_war_battles(db_player)

        db_player.last_refresh = self.now
        db_player.save()

    def read_player_clan(self, db_player, **kwargs):
        """
        Read the clan of a given player
        :param Player db_player: The player to read clan
        :param dict kwargs:
        :return: None
        """
        player = kwargs.get('player', self.client.get_player(db_player.tag))

        if player.clan is None:
            try:
                pch = PlayerClanHistory.objects.filter(player=db_player, left_clan__isnull=True).latest('id')
                pch.left_clan = self.now
                pch.save()
            except PlayerClanHistory.DoesNotExist:
                return
        else:
            actual_clan, clan_created = Clan.objects.get_or_create(
                tag=player.clan.tag[1:],
                defaults={'name': player.clan.name}
            )
            try:
                db_player_clan = PlayerClanHistory.objects.filter(player=db_player, left_clan__isnull=True).latest('id')
            except PlayerClanHistory.DoesNotExist:
                if not db_player.refresh and not actual_clan.refresh:
                    self._log('Unknow player #{} joined unknown clan {}'.format(db_player.tag, player.clan.tag), 'WARN')

                PlayerClanHistory.joined(db_player, actual_clan, clan_is_new=clan_created, now=self.now)
                return

            if db_player_clan.clan_id != actual_clan.id:
                db_player_clan.left_clan = self.now
                db_player_clan.save()
                PlayerClanHistory.joined(db_player, actual_clan, clan_is_new=clan_created, now=self.now)

    def read_player_stats(self, db_player, player=None):
        """
        Refresh a single user's profile

        :param Player db_player: a player from database
        :param Box player: data to be read
        :return: False on APIError
        """
        if player is None:
            player = self.client.get_player(db_player.tag)

        if not db_player.name:
            db_player, _ = Player.objects.get_or_create(tag=player.tag[1:], defaults={'refresh': db_player.refresh})
        db_player.name = player.name

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
            'defaults': {'timestamp': self.now}
        }
        db_player_stats, _ = PlayerStatsHistory.create_or_get(**query_fields)
        db_player_stats.favorite_card = Card.instance_from_data(player.current_favourite_card).key
        db_player_stats.win_3_crowns = player.three_crown_wins
        db_player_stats.draws = player.battle_count - player.wins - player.losses
        db_player_stats.losses = player.losses
        db_player_stats.wins = player.wins
        db_player_stats.clan_cards_collected = player.clan_cards_collected
        db_player_stats.war_day_wins = player.war_day_wins

        db_player_stats.last_refresh = self.now
        db_player_stats.save()

        # Player seasons (current & best seasons skipped)
        if player.league_statistics is not None and 'previousSeason' in player.league_statistics.keys():
            prev_season = player.league_statistics.previous_season
            db_season, _ = LeagueSeason.objects.get_or_create(
                identifier=prev_season.id,
                defaults={'timestamp': self.now}
            )

            PlayerSeason.objects.get_or_create(
                player=db_player,
                season=db_season,
                defaults={
                    'ending_rank': prev_season.rank if 'rank' in prev_season.keys() else None,
                    'highest': prev_season.best_trophies if 'bestTrophies' in prev_season.keys() else prev_season.trophies,
                    'ending': prev_season.trophies
                }
            )
        return True

    def read_player_cards(self, db_player, cards=None):
        """
        Read cards from a player fetched by the client
        :param Player db_player: the player we are reading
        :param list cards: the data to be read
        :return: None
        """
        if cards is None:
            cards = self.client.get_player(db_player.tag).cards
        if not cards:
            return

        for card in cards:
            db_card = Card.instance_from_data(card)
            db_pcl, created = PlayerCardLevel.create_or_get(player=db_player, card=db_card)
            if db_pcl.count != card.count:
                db_pcl.count = card.count
            db_pcl.level = card.level
            db_pcl.count = card.count
            db_pcl.star_level = card.star_level if 'starLevel' in card.keys() else 0
            db_pcl.save()

    def _get_ordered_battles(self, db_player):
        return sorted(self.client.get_player_battles(db_player.tag), key=lambda x: x.battle_time)

    def _get_battle_time(self, battle):
        return timezone.make_aware(self.client.get_datetime(battle.battle_time, unix=False), timezone=timezone.utc)

    def read_player_war_battles(self, db_player):
        """
        Read war battles for a given player - other battles are ignored
        :param Player db_player:
        :return: None
        """
        battles = self.client.get_player_battles(db_player.tag)
        latest_battle = self._get_last_from_database(Battle, False, team__id__exact=db_player.id)

        war_battles = []
        for b in sorted(battles, key=lambda x: x.battle_time):
            time = self._get_battle_time(b)
            if latest_battle and time <= latest_battle.time:
                break
            else:
                # We only care about war battles, not all battles
                if b.type.startswith("clanWar"):
                    war_battles.append(b)

        for b in war_battles:
            time = self._get_battle_time(b)
            db_battle = Battle(time=time)

            try:
                mode = BattleMode.objects.get(name="War%s" % b.game_mode.name)
            except BattleMode.DoesNotExist:
                mode = BattleMode(name="War%s" % b.game_mode.name)
                mode.type = b.type
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
