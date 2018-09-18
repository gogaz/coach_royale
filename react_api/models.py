from django.db import models


def int_difference_instances(obj1, obj2, excluded_keys=()):
    d1, d2 = obj1.__dict__, obj2.__dict__
    res = {}
    for k, v in d1.items():
        if k in excluded_keys:
            continue
        try:
            if isinstance(v, int) and v != d2[k] and d2[k] is not None:
                res.update({k: v - d2[k]})
        except KeyError:
            pass

    return res


class Arena(models.Model):
    id = models.AutoField(primary_key=True)
    tag = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    icon = models.CharField(max_length=255)
    number = models.IntegerField()


class Card(models.Model):
    id = models.AutoField(primary_key=True)
    key = models.CharField(max_length=64)
    name = models.CharField(max_length=255)
    rarity = models.CharField(max_length=64)
    arena = models.IntegerField(null=True)
    elixir = models.IntegerField(null=True)
    max_level = models.IntegerField(null=True)
    type = models.CharField(max_length=64)
    image = models.CharField(max_length=512)

    def __str__(self):
        return self.name

    @staticmethod
    def instance_from_data(data):
        fc, created = Card.objects.get_or_create(key=data.key)
        if created:
            fc.name = data.name
            fc.arena = data.arena
            fc.elixir = data.elixir
            fc.rarity = data.rarity
            fc.image = data.icon
            fc.type = data.type
            fc.max_level = data.max_level
            fc.save()
        return fc


class PlayerCardLevel(models.Model):
    id = models.AutoField(primary_key=True)
    player = models.ForeignKey("Player", related_name='card_level', on_delete=models.CASCADE)
    card = models.ForeignKey(Card, related_name='player', on_delete=models.CASCADE)
    count = models.IntegerField(null=True)
    level = models.IntegerField(null=True)


# PLAYER / CLAN
class PlayerClanHistory(models.Model):
    id = models.AutoField(primary_key=True)
    clan = models.ForeignKey('Clan', null=True, on_delete=models.CASCADE)
    player = models.ForeignKey('Player', null=True, on_delete=models.CASCADE)
    # Used internally to detect when a user joins a clan
    joined_clan = models.DateTimeField(null=True)
    # Used internally to detect when a user leaves a clan
    left_clan = models.DateTimeField(null=True)

    def __str__(self):
        return "{0.player} joined clan {0.clan}".format(self)


class PlayerClanStatsHistory(models.Model):
    id = models.AutoField(primary_key=True)
    clan = models.ForeignKey('Clan', null=True, on_delete=models.CASCADE)
    player = models.ForeignKey('Player', null=True, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(null=True)
    last_refresh = models.DateTimeField(null=True)

    clan_role = models.CharField(max_length=255)
    current_clan_rank = models.IntegerField(null=True)
    previous_clan_rank = models.IntegerField(null=True)
    donations = models.IntegerField(null=True)
    donations_received = models.IntegerField(null=True)

    # duplication to allow easy use
    level = models.IntegerField(null=True)
    trophies = models.IntegerField(null=True)
    arena = models.IntegerField(null=True)

    def __str__(self):
        return "{0.player}'s activity in clan {0.clan} ({0.last_refresh})".format(self)


class PlayerStatsHistory(models.Model):
    id = models.AutoField(primary_key=True)
    player = models.ForeignKey('Player', null=True, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(null=True)
    last_refresh = models.DateTimeField(null=True)

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


class PlayerSeason(models.Model):
    id = models.AutoField(primary_key=True)
    player = models.ForeignKey('Player', null=True, on_delete=models.CASCADE)
    identifier = models.IntegerField(null=True)
    highest = models.IntegerField(null=True)
    ending = models.IntegerField(null=True)
    ending_rank = models.IntegerField(null=True)

    def __str__(self):
        return "Season {0.identifier} - {0.player}".format(self)


class Player(models.Model):
    id = models.AutoField(primary_key=True)
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


class Clan(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    tag = models.CharField(max_length=32)
    last_refresh = models.DateTimeField(null=True)
    refresh = models.BooleanField(default=False)

    def __str__(self):
        return "{0.name} (#{0.tag})".format(self)


class ClanHistory(models.Model):
    id = models.AutoField(primary_key=True)
    clan = models.ForeignKey(Clan, null=True, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(null=True)
    score = models.IntegerField(null=True)
    highest_score = models.IntegerField(null=True)
    required_trophies = models.IntegerField(null=True)
    type = models.CharField(max_length=255)
    # Removed from the game
    description = models.CharField(max_length=255)
    member_count = models.IntegerField(null=True)
    donations = models.IntegerField(null=True)
    region = models.CharField(max_length=64)
    badge = models.CharField(max_length=512)
    trophies = models.IntegerField(null=True)
    # Wars
    war_state = models.CharField(max_length=512, null=True)
    # Synchronization configuration
    last_refresh = models.DateTimeField(null=True)

    def __str__(self):
        return "History for clan {0.clan} ({0.last_refresh})".format(self)


class BattleMode(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=64)
    card_levels = models.CharField(max_length=64)
    overtime = models.IntegerField(null=True)
    same_deck = models.BooleanField(default=False)
    war_day = models.BooleanField(default=False)
    collection_day = models.BooleanField(default=False)

    def __str__(self):
        return self.name


class Battle(models.Model):
    id = models.AutoField(primary_key=True)
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


class ClanWar(models.Model):
    id = models.AutoField(primary_key=True)
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
    trophies = models.IntegerField(null=True)
    season = models.IntegerField(null=True)

    def __str__(self):
        return "Clan {} started war on {}".format(self.clan, self.date_start.strftime("%Y-%m-%d"))


class PlayerClanWar(models.Model):
    id = models.AutoField(primary_key=True)
    player = models.ForeignKey(Player, on_delete=models.CASCADE)
    clan_war = models.ForeignKey(ClanWar, on_delete=models.CASCADE)
    final_battles = models.IntegerField(null=True)
    final_battles_done = models.IntegerField(null=True)
    final_battles_wins = models.IntegerField(null=True)
    crowns = models.IntegerField(null=True)
    collections_cards_earned = models.IntegerField(null=True)
    collections_battles = models.IntegerField(null=True, default=0)
    collections_battles_done = models.IntegerField(null=True)
    collections_battles_wins = models.IntegerField(null=True, default=0)

    def __str__(self):
        return "{} in {} (x{} / {})".format(self.player, self.clan_war, self.collections_cards_earned,
                                            "Win" if self.final_battles_wins else "Lose" if self.final_battles_done else "X")


class TournamentRefresh(models.Model):
    timestamp = models.DateTimeField()
    success = models.BooleanField()
    error = models.TextField()


class Tournament(models.Model):
    tag = models.CharField(max_length=20)
    name = models.CharField(max_length=255)
    open = models.BooleanField()
    max_players = models.IntegerField()
    status = models.CharField(max_length=50)
    create_time = models.DateTimeField()
    prep_time = models.IntegerField()  # in seconds
    start_time = models.DateTimeField(null=True)
    end_time = models.DateTimeField(null=True)
    duration = models.IntegerField()  # in seconds
