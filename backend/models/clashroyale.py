from django.db import models
from django.contrib.postgres.fields import JSONField
from django.db.models import Q, F
from django.utils import timezone

from .base import BaseModel, HistoryModel, EditableModel


class Arena(EditableModel):
    name = models.CharField(max_length=256)
    key = models.CharField(max_length=256)
    arena = models.IntegerField()
    arena_id = models.IntegerField(unique=True)
    min_trophy_limit = models.IntegerField()
    max_trophy_limit = models.IntegerField()
    is_in_use = models.IntegerField(default=False)
    blob = JSONField()

    @classmethod
    def in_use(cls):
        return cls.objects.filter(is_in_use=True)

    @classmethod
    def from_trophies(cls, trophies):
        if trophies is None:
            return None
        return cls.objects.filter(min_trophy_limit__lte=trophies, max_trophy_limit__gt=trophies).first()

    def __str__(self):
        return '{} ({})'.format(self.name, self.arena)

    def __getattr__(self, item):
        if item in self.blob.keys():
            return self.blob[item]
        else:
            return super(Arena, self).__getattr__(item)


class Card(EditableModel):
    card_id = models.IntegerField(null=True, unique=True)
    key = models.CharField(max_length=64, unique=True)
    name = models.CharField(max_length=255)
    rarity = models.CharField(max_length=64)
    arena = models.IntegerField(null=True)
    elixir = models.IntegerField(null=True)
    max_level = models.IntegerField(null=True)
    type = models.CharField(max_length=64)
    image = models.CharField(max_length=512)
    blob = JSONField(null=True)

    def __str__(self):
        return self.name

    @classmethod
    def key_from_name(cls, name: str):
        return name.lower().\
            replace(' ', '-').\
            replace('.', '')

    @classmethod
    def instance_from_data(cls, data):
        key = data.key if 'key' in data.keys() else cls.key_from_name(data.name)
        card, created = Card.objects.get_or_create(key=key)

        # In most cases, Cards shouldn't be created from here, but it can happen when a new card is released in the game
        if created:
            # card.key = data.key if 'key' in data.keys() else cls.key_from_name(data.name)
            card.card_id = data.id
            card.name = data.name
            card.save()

        if not card.image and 'icon_urls' in data.keys():
            card.image = data.icon_urls.medium
            card.save()

        if not card.max_level and 'max_level' in data.keys():
            card.max_level = data.max_level
            card.save()

        return card

    def __getattr__(self, item):
        if item in self.blob.keys():
            return self.blob[item]
        else:
            return super().__getattr__(item)


class PlayerCardLevel(HistoryModel):
    player = models.ForeignKey("Player", related_name='card_level', on_delete=models.CASCADE)
    card = models.ForeignKey(Card, related_name='player', on_delete=models.CASCADE)
    count = models.IntegerField(null=True)
    level = models.IntegerField(null=True)
    star_level = models.IntegerField(null=True)


# PLAYER / CLAN
class PlayerClanHistory(BaseModel):
    clan = models.ForeignKey('Clan', null=True, on_delete=models.CASCADE)
    player = models.ForeignKey('Player', null=True, on_delete=models.CASCADE)
    # Used internally to detect when a user joins a clan
    joined_clan = models.DateTimeField(null=True)
    # Used internally to detect when a user leaves a clan
    left_clan = models.DateTimeField(null=True)

    def __str__(self):
        action = "joined"
        if self.left_clan is not None:
            action = "left"
        return "{0.player} {1} clan {0.clan}".format(self, action)

    @classmethod
    def joined(cls, db_player, db_clan, clan_is_new=False, now=None):
        db_player_clan = PlayerClanHistory(
            player=db_player,
            clan_id=db_clan.id,
            left_clan=None,
            joined_clan=None if clan_is_new else (now or timezone.now())
        )
        db_player_clan.save()
        return db_player_clan


class PlayerClanStatsHistory(HistoryModel):
    clan = models.ForeignKey('Clan', null=True, on_delete=models.CASCADE)
    player = models.ForeignKey('Player', null=True, on_delete=models.CASCADE)

    clan_role = models.CharField(max_length=255)
    current_clan_rank = models.IntegerField(null=True)
    previous_clan_rank = models.IntegerField(null=True)
    donations = models.IntegerField(null=True)
    donations_received = models.IntegerField(null=True)
    last_seen = models.DateTimeField(null=True)

    # duplication to allow easy use
    level = models.IntegerField(null=True)
    trophies = models.IntegerField(null=True)
    arena = models.IntegerField(null=True)

    def __str__(self):
        return "{0.player}'s activity in clan {0.clan} ({0.last_refresh})".format(self)


class PlayerStatsHistory(HistoryModel):
    player = models.ForeignKey('Player', null=True, on_delete=models.CASCADE)

    # Player stats
    level = models.IntegerField()
    total_donations = models.IntegerField(null=True)
    highest_trophies = models.IntegerField()
    current_trophies = models.IntegerField()
    challenge_cards_won = models.IntegerField(null=True)
    tourney_cards_won = models.IntegerField(null=True)
    cards_found = models.IntegerField(null=True)
    favorite_card = models.CharField(max_length=255)
    arena = models.IntegerField(null=True)
    star_points = models.IntegerField(null=True)

    # Games stats
    total_games = models.IntegerField(null=True)
    tournament_games = models.IntegerField(null=True)
    wins = models.IntegerField(null=True)
    losses = models.IntegerField(null=True)
    draws = models.IntegerField(null=True)
    win_3_crowns = models.IntegerField(null=True)

    # War stats
    clan_cards_collected = models.IntegerField(null=True)
    war_day_wins = models.IntegerField(null=True)

    def __str__(self):
        return "Stats history for player {0.player} ({0.last_refresh})".format(self)


class LeagueSeason(BaseModel):
    identifier = models.CharField(max_length=32)
    timestamp = models.DateTimeField()


class PlayerSeason(BaseModel):
    player = models.ForeignKey('Player', null=True, on_delete=models.CASCADE)
    season = models.ForeignKey(LeagueSeason, null=True, on_delete=models.CASCADE)
    highest = models.IntegerField(null=True)
    ending = models.IntegerField(null=True)
    ending_rank = models.IntegerField(null=True)

    def __str__(self):
        return "Season {0.identifier} - {0.player}".format(self)


class Player(BaseModel):
    tag = models.CharField(max_length=32)
    name = models.CharField(max_length=255)

    # Chest cycle
    # chest_cycle_position = models.IntegerField(null=True)
    # chest_super_magical_position = models.IntegerField(null=True)
    # chest_legendary_position = models.IntegerField(null=True)
    # chest_epic_position = models.IntegerField(null=True)

    # Shop offers
    # offer_legendary = models.IntegerField(null=True)
    # offer_epic = models.IntegerField(null=True)
    # offer_arena = models.IntegerField(null=True)

    # Synchronization configuration
    last_refresh = models.DateTimeField(null=True)
    refresh = models.BooleanField(default=False)

    def __str__(self):
        return "{} (#{})".format(self.name, self.tag)

    def _get_latest_clan_sql(self):
        return """
            SELECT backend_clan.id
            FROM backend_clan
            JOIN (
                SELECT MAX(id) as max_id, clan_id FROM backend_playerclanhistory GROUP BY player_id
            ) player_clan ON player_clan.clan_id = backend_clan.id
            JOIN backend_playerclanhistory ON backend_playerclanhistory.id = player_clan.max_id
            WHERE backend_playerclanhistory.player_id = {0.id} AND left_clan IS NULL;
            """.format(self)

    def get_latest_clan(self):
        try:
            return Clan.objects.filter(id=Clan.objects.raw(self._get_latest_clan_sql())[0].id)
        except Clan.DoesNotExist:
            return None

    def get_clan(self, date=None):
        if date is None:
            return self.get_latest_clan()

        clan = Clan.objects.filter(
            (Q(playerclanhistory__joined_clan__isnull=True) & Q(playerclanhistory__left_clan__gte=date)) |
            (Q(playerclanhistory__joined_clan__isnull=True) & Q(playerclanhistory__left_clan__isnull=True)) |
            Q(playerclanhistory__joined_clan__lt=date, playerclanhistory__left_clan__gte=date) |
            Q(playerclanhistory__joined_clan__lt=date, playerclanhistory__left_clan__isnull=True),
            playerclanhistory__player=self
        )
        try:
            return clan.get()
        except Clan.DoesNotExist:
            return None

    @classmethod
    def find(cls, tag):
        return cls.objects.get(tag=tag)

    @classmethod
    def create_clan_history(cls, tag, new_clan, clan_created, now=None):
        if now is None:
            now = timezone.now()

        p = cls.objects.get(tag=tag)
        db_player_clan, created = PlayerClanHistory.objects.get_or_create(player=p, left_clan__isnull=True)
        if created:
            db_player_clan.clan = new_clan
            db_player_clan.joined_clan = now
        else:
            db_player_clan.left_clan = now
            db_player_clan.save()
            db_player_clan, _ = PlayerClanHistory.objects.get_or_create(player=p, left_clan__isnull=True)
            db_player_clan.clan = new_clan

        if clan_created:
            db_player_clan.joined_clan = None
        else:
            db_player_clan.joined_clan = now
        db_player_clan.save()

        return p


class Clan(BaseModel):
    name = models.CharField(max_length=255)
    tag = models.CharField(max_length=32)
    last_refresh = models.DateTimeField(null=True)
    refresh = models.BooleanField(default=False)

    def __str__(self):
        return "{0.name} (#{0.tag})".format(self)

    def _get_current_player_ids_sql(self):
        return """
            SELECT backend_player.id
            FROM backend_player
            JOIN (
                SELECT MAX(id) as max_id, player_id FROM backend_playerclanhistory GROUP BY player_id
            ) player_clan ON player_id = backend_player.id
            JOIN backend_playerclanhistory clan_history ON clan_history.id = player_clan.max_id
            WHERE clan_id = {0.id} AND left_clan IS NULL;
            """.format(self).strip()

    def get_current_players(self):
        return Player.objects.filter(id__in=[x.id for x in Player.objects.raw(self._get_current_player_ids_sql())])

    def get_players(self, date=None):
        if date is None:
            return self.get_current_players()

        return Player.objects.filter(
            # Player left after given date OR
            Q(playerclanhistory__joined_clan__isnull=True, playerclanhistory__left_clan__gte=date) |
            # Player never joined (i.e. before the clan was tracked) and never left OR
            Q(playerclanhistory__joined_clan__isnull=True, playerclanhistory__left_clan__isnull=True) |
            # Player arrived before given date and left after OR
            Q(playerclanhistory__joined_clan__lt=date, playerclanhistory__left_clan__gte=date) |
            # Player arrived before given date and did not left
            Q(playerclanhistory__joined_clan__lt=date, playerclanhistory__left_clan__isnull=True),
            playerclanhistory__clan=self
        )

    def get_players_battles(self):
        return Battle.objects.filter(
            (
                Q(team__playerclanhistory__joined_clan__isnull=True) &
                Q(team__playerclanhistory__left_clan__gte=F('time'))
            ) |
            (
                Q(team__playerclanhistory__joined_clan__isnull=True) &
                Q(team__playerclanhistory__left_clan__isnull=True)
            ) |
            Q(team__playerclanhistory__joined_clan__lte=F('time'), team__playerclanhistory__left_clan__gte=F('time')) |
            Q(
                team__playerclanhistory__joined_clan__lte=F('time'),
                team__playerclanhistory__left_clan__isnull=True
            ),
            team__playerclanhistory__clan=self
        )

    def associate_war_battles(self):
        """
        Tries to associates all player battles with a war
        :return:
        """
        orphan_battles = self.get_players_battles().filter(war__isnull=True, mode__war_day=True, war_processing_status='pending')
        for battle in orphan_battles:
            battle.process_war(self)


class ClanHistory(HistoryModel):
    clan = models.ForeignKey(Clan, null=True, on_delete=models.CASCADE)
    score = models.IntegerField(null=True)
    highest_score = models.IntegerField(null=True)
    required_trophies = models.IntegerField(null=True)
    type = models.CharField(max_length=255)
    # Removed from the game
    description = models.CharField(max_length=255)
    member_count = models.IntegerField(null=True)
    donations = models.IntegerField(null=True)
    region = models.CharField(max_length=64)
    region_code = models.CharField(max_length=2)
    region_id = models.IntegerField(null=True)
    badge = models.CharField(max_length=512)
    # Unused as of CR Update of 09/2020
    trophies = models.IntegerField(null=True)
    prev_local_rank = models.IntegerField(null=True)
    local_rank = models.IntegerField(null=True)
    prev_global_rank = models.IntegerField(null=True)
    global_rank = models.IntegerField(null=True)
    prev_local_war_rank = models.IntegerField(null=True)
    local_war_rank = models.IntegerField(null=True)
    prev_global_war_rank = models.IntegerField(null=True)
    global_war_rank = models.IntegerField(null=True)
    # Wars
    war_state = models.CharField(max_length=512, null=True)
    clan_war_trophies = models.IntegerField(null=True)

    def __str__(self):
        return "History for clan {0.clan} ({0.last_refresh})".format(self)


class BattleMode(BaseModel):
    name = models.CharField(max_length=64)
    type = models.CharField(max_length=128, null=True)
    card_levels = models.CharField(max_length=64)
    overtime = models.IntegerField(null=True)
    same_deck = models.BooleanField(default=False)
    war_day = models.BooleanField(default=False)
    collection_day = models.BooleanField(default=False)

    def __str__(self):
        return self.name


class Battle(BaseModel):
    WAR_PROCESSING_STATUS_CHOICES = [
        ('pending', 'pending'),
        ('processed', 'processed'),
        ('failure', 'failure')
    ]

    mode = models.ForeignKey(BattleMode, related_name='mode', on_delete=models.CASCADE)
    arena = models.CharField(max_length=64)
    time = models.DateTimeField(null=True)
    team_crowns = models.IntegerField(null=True)
    opponent_crowns = models.IntegerField(null=True)
    team_size = models.IntegerField()
    team = models.ManyToManyField(Player, related_name='team')
    opponent = models.ManyToManyField(Player, related_name='opponent')
    player_deck = models.ManyToManyField(Card, related_name='team_1_deck')
    player_deck_link = models.CharField(max_length=128, null=True)
    team_deck = models.ManyToManyField(Card, related_name='team_2_deck')
    team_deck_link = models.CharField(max_length=128, null=True)
    opponent_deck = models.ManyToManyField(Card, related_name='opponent_1_deck')
    opponent_deck_link = models.CharField(max_length=128, null=True)
    opponent_team_deck = models.ManyToManyField(Card, related_name='opponent_2_deck')
    opponent_team_deck_link = models.CharField(max_length=128, null=True)
    war = models.ForeignKey('ClanWar', null=True, on_delete=models.SET_NULL)
    win = models.BooleanField(default=False)
    war_processing_status = models.CharField(max_length=64, choices=WAR_PROCESSING_STATUS_CHOICES, default='pending')

    def get_matching_war(self, clan, war=None):
        """
        Resolves a war matching battle dates and given clan, None otherwise
        :param Clan clan: to discriminate wars
        :param ClanWar war: an optional war for caching and avoid un-necessary requests
        :return:
        """

        if war and war.date_start <= self.time <= war.date_end:
            return war

        try:
            return ClanWar.objects.get(
                clan=clan,
                date_start__lte=self.time,
                date_end__gte=self.time
            )
        except ClanWar.DoesNotExist:
            return None
        except ClanWar.MultipleObjectsReturned:
            return None

    def process_war(self, clan=None):
        war = self.get_matching_war(clan)
        if war is None:
            if timezone.now() - self.time > timezone.timedelta(days=8):
                self.war_processing_status = 'failure'
                self.save()
                return

        self.war = war
        self.war_processing_status = 'processed'
        self.save()


class ClanWar(BaseModel):
    clan = models.ForeignKey(Clan, null=True, on_delete=models.CASCADE)
    date_start = models.DateTimeField(null=True)
    date_end = models.DateTimeField(null=True)
    participants = models.IntegerField(null=True)
    final_battles = models.IntegerField(null=True)
    collections_battles = models.IntegerField(null=True)
    wins = models.IntegerField(null=True)
    losses = models.IntegerField(null=True)
    collections_cards = models.IntegerField(null=True)
    crowns = models.IntegerField(null=True)
    final_position = models.IntegerField(null=True)
    total_trophies = models.IntegerField(null=True)
    trophies = models.IntegerField(null=True)
    season = models.IntegerField(null=True)
    fame = models.IntegerField(default=0)
    repair_points = models.IntegerField(default=0)
    finish_time = models.IntegerField(null=True)
    is_river_race = models.BooleanField(default=False)
    competitors_count = models.IntegerField(default=5)

    def __str__(self):
        return "Clan {} started war on {} (#{})".format(self.clan, self.date_start.strftime("%Y-%m-%d"), self.final_position)

    def is_battle_during_collection_day(self, battle: Battle):
        date_start = self.date_start - timezone.timedelta(hours=1)
        date_end = self.date_start + timezone.timedelta(hours=25)  # 1 day plus 1 hour delay
        return date_start <= battle.time <= date_end


class PlayerClanWar(BaseModel):
    player = models.ForeignKey(Player, on_delete=models.CASCADE)
    clan_war = models.ForeignKey(ClanWar, on_delete=models.CASCADE)
    final_battles = models.IntegerField(null=True)
    final_battles_done = models.IntegerField(null=True)
    final_battles_wins = models.IntegerField(null=True)
    final_battles_misses = models.IntegerField(null=True)
    crowns = models.IntegerField(null=True)
    collections_cards_earned = models.IntegerField(null=True)
    collections_battles = models.IntegerField(null=True, default=0)
    collections_battles_done = models.IntegerField(null=True)
    collections_battles_wins = models.IntegerField(null=True, default=0)
    fame = models.IntegerField(default=0)
    repair_points = models.IntegerField(default=0)

    def __str__(self):
        return "{0.player} in {0.clan_war} ({0.fame} fame | {0.repair_points} repair pts)".format(self)
