from django.db import models, connection, migrations


class PlayerCube(models.Model):
    VIEW_SQL = """
        WITH player_war_metrics AS (
            SELECT
                player_id,
                COUNT(id) AS wars_participated,
                SUM(final_battles_misses) AS final_battles_missed,
                SUM(final_battles_wins) AS final_battles_won,
                SUM(final_battles_done) - SUM(final_battles_wins) AS final_battles_lost,
                SUM(final_battles_done) AS final_battles_done,
                SUM(final_battles_misses) + SUM(final_battles_done) AS total_final_battles_available
            FROM backend_playerclanwar
            -- We are interested in all recorded wars from the player because this app is supposed to manage one clan or
            --   a family of clans and not to continue tracking a player that exited a tracked clan
            -- Otherwise, it's easy to JOIN backend_clan from here, select and group on its id, then join on it in
            --    main query
            GROUP BY backend_playerclanwar.player_id
        )
        SELECT
            backend_player.id,
            backend_player.id AS player_id,
            backend_player.name,
            backend_clan.id AS clan_id,
            backend_clan.name AS clan_name,
            backend_playerclanhistory.joined_clan,
            backend_playerstatshistory.level,
            backend_playerstatshistory.total_donations,
            backend_playerstatshistory.current_trophies AS trophies,
            backend_playerstatshistory.highest_trophies,
            backend_playerstatshistory.challenge_cards_won,
            backend_playerstatshistory.tourney_cards_won,
            backend_playerstatshistory.cards_found,
            backend_playerstatshistory.favorite_card,
            backend_playerstatshistory.arena,
            backend_playerstatshistory.total_games,
            backend_playerstatshistory.tournament_games,
            backend_playerstatshistory.wins,
            backend_playerstatshistory.losses,
            backend_playerstatshistory.draws,
            backend_playerstatshistory.win_3_crowns,
            backend_playerclanstatshistory.clan_role,
            backend_playerclanstatshistory.current_clan_rank,
            backend_playerclanstatshistory.previous_clan_rank,
            backend_playerclanstatshistory.donations AS donations_this_week,
            backend_playerclanstatshistory.donations_received AS donations_received_this_week,
            COALESCE(player_war_metrics.wars_participated, 0) AS wars_participated,
            COALESCE(player_war_metrics.total_final_battles_available, 0) AS total_final_battles_available,
            COALESCE(player_war_metrics.final_battles_done, 0) AS final_battles_done,
            COALESCE(player_war_metrics.final_battles_missed, 0) AS final_battles_missed,
            COALESCE(player_war_metrics.final_battles_lost, 0) AS final_battles_lost,
            COALESCE(player_war_metrics.final_battles_won, 0) AS final_battles_won,
            COALESCE(final_battles_missed::FLOAT * 100 / total_final_battles_available, 0) AS missed_ratio,
            COALESCE(final_battles_won::FLOAT * 100 / total_final_battles_available, 0) AS won_ratio,
            COALESCE(final_battles_lost::FLOAT * 100 / total_final_battles_available, 0) AS lost_ratio
        FROM backend_player
        INNER JOIN (
            SELECT player_id, MAX(id) AS max_id
            FROM backend_playerclanhistory
            GROUP BY player_id
        ) player_clan ON backend_player.id = player_clan.player_id
        INNER JOIN (
            SELECT player_id, MAX(id) AS max_id
            FROM backend_playerclanstatshistory
            GROUP BY player_id
        ) player_clanstats ON backend_player.id = player_clanstats.player_id
        INNER JOIN (
            SELECT player_id, MAX(id) AS max_id
            FROM backend_playerstatshistory
            GROUP BY player_id
        ) player_stats ON backend_player.id = player_stats.player_id
        LEFT JOIN player_war_metrics ON player_war_metrics.player_id = backend_player.id
        INNER JOIN backend_playerclanhistory ON player_clan.max_id = backend_playerclanhistory.id
        INNER JOIN backend_clan ON backend_playerclanhistory.clan_id = backend_clan.id
        LEFT JOIN (
            SELECT
                COUNT(id),
                clan_id
            FROM backend_clanwar
            GROUP BY clan_id
        ) clan_wars ON backend_clan.id = clan_wars.clan_id
        JOIN backend_playerclanstatshistory ON backend_playerclanstatshistory.id = player_clanstats.max_id
        JOIN backend_playerstatshistory ON backend_playerstatshistory.id = player_stats.max_id
        WHERE backend_playerclanhistory.left_clan IS NULL;
    """

    class Meta:
        managed = False
        db_table = 'backend_playercube'
        app_label = 'backend'

    @classmethod
    def drop_view_sql(cls):
        return "DROP MATERIALIZED VIEW IF EXISTS %s;" % cls._meta.db_table

    @classmethod
    def drop_view(cls):
        with connection.cursor() as cursor:
            cursor.execute(cls.drop_view_sql())

    @classmethod
    def create_view_sql(cls):
        return "CREATE MATERIALIZED VIEW %s AS %s" % (cls._meta.db_table, PlayerCube.VIEW_SQL)

    @classmethod
    def migrate(cls):
        return migrations.RunSQL(
            cls.drop_view_sql() + cls.create_view_sql(),
            reverse_sql=cls.drop_view_sql()
        )

    @classmethod
    def _create_view(cls):
        with connection.cursor() as cursor:
            cursor.execute(cls.create_view_sql())

    @classmethod
    def create_view(cls):
        cls.drop_view()
        cls._create_view()

    @classmethod
    def refresh_view(cls):
        with connection.cursor() as cursor:
            cursor.execute("REFRESH MATERIALIZED VIEW %s;" % cls._meta.db_table)

    player = models.ForeignKey('Player', on_delete=models.DO_NOTHING)
    name = models.CharField(max_length=255)
    clan = models.ForeignKey('Clan', on_delete=models.DO_NOTHING)
    clan_role = models.CharField(max_length=32)
    clan_name = models.CharField(max_length=255)
    joined_clan = models.DateTimeField()
    level = models.IntegerField()
    total_donations = models.IntegerField()
    trophies = models.IntegerField()
    highest_trophies = models.IntegerField()
    challenge_cards_won = models.IntegerField()
    tourney_cards_won = models.IntegerField()
    cards_found = models.IntegerField()
    favorite_card = models.CharField(max_length=128)
    arena = models.IntegerField()
    total_games = models.IntegerField()
    tournament_games = models.IntegerField()
    wins = models.IntegerField()
    losses = models.IntegerField()
    draws = models.IntegerField()
    win_3_crowns = models.IntegerField()
    current_clan_rank = models.IntegerField()
    previous_clan_rank = models.IntegerField()
    donations_this_week = models.IntegerField()
    donations_received_this_week = models.IntegerField()
    wars_participated = models.IntegerField()
    total_final_battles_available = models.IntegerField()
    final_battles_done = models.IntegerField()
    final_battles_missed = models.IntegerField()
    final_battles_lost = models.IntegerField()
    final_battles_won = models.IntegerField()
    missed_ratio = models.FloatField()
    won_ratio = models.FloatField()
    lost_ratio = models.FloatField()
