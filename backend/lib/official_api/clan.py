from .base import APIConsumer as BaseConsumer
from django.utils import timezone

from backend.models import (
    Clan,
    ClanHistory,
    Player,
    PlayerClanStatsHistory,
    PlayerClanHistory,
    ClanWar,
    PlayerClanWar
)


# Since the list is ordered, we only have to find the position of the given clan in the list to know its rank. If the
#   clan is not in the list then it's not ranked
def read_clan_ranking(rankings, clan_tag, clan_stats, attr_name):
    """
    Sets global or local clan ranking info on a clan history object
    :param list rankings:
    :param str clan_tag:
    :param ClanHistory clan_stats:
    :param str attr_name: must be in (local, global, local_war, global_war) - see backend.models.clashroyale.ClanHistory
    :return:
    """
    try:
        ranking = next(x for x in rankings if x.tag[1:] == clan_tag)
    except StopIteration:
        return None
    setattr(clan_stats, '{}_rank'.format(attr_name), ranking.rank)
    setattr(clan_stats, 'prev_{}_rank'.format(attr_name), ranking.previous_rank)
    return ranking


class APIConsumer(BaseConsumer):
    def read_clan(self, tag, track_clan=False):
        """
        :param str tag: clan tag without the initial #
        :param bool track_clan: whether the clan should be tracked or not (only used on clan creation)
        :return: None
        """
        clan = self.client.get_clan(tag)
        db_clan, created = Clan.objects.get_or_create(tag=tag, defaults={'name': clan.name, 'refresh': track_clan})

        self._log("Refreshing clan %s" % db_clan.tag)
        self.read_clan_stats(db_clan, clan)
        self.read_clan_members(db_clan, clan, clan_created=created)
        self._log("Refreshing river race status for clan #%s" % db_clan.tag)
        self.read_river_race_log(db_clan)

    def read_clan_stats(self, db_clan, clan=None):
        """
        Used to refresh a single clan
        :param Clan db_clan: a clan record
        :param clan: a set of data retrieved using the Official API
        :return: False on error
        """
        if clan is None:
            clan = self.client.get_clan(db_clan.tag)

        now = timezone.now()
        db_clan.last_refresh = now
        db_clan.save()

        try:
            previous_history = ClanHistory.objects.filter(clan=db_clan).order_by('-last_refresh')[0]
        except IndexError:
            previous_history = None

        db_clan_history, created = ClanHistory.create_or_get(
            clan=db_clan,
            score=clan.clan_score,
            trophies=clan.clan_war_trophies,
            required_trophies=clan.required_trophies,
            clan_war_trophies=clan.clan_war_trophies,
            type=clan.type,
            description=clan.description,
            member_count=clan.members,
            donations=clan.donations_per_week,
            region=clan.location.name,
            region_code=clan.location.country_code,
            region_id=clan.location.id,
            badge=self.client.get_clan_image(clan)
        )

        db_clan_history.last_refresh = now
        if created:
            db_clan_history.timestamp = now

        if db_clan_history.highest_score is None or db_clan_history.highest_score < clan.clan_score:
            db_clan_history.highest_score = clan.score

        if previous_history:
            db_clan_history.highest_score = clan.clan_score if clan.clan_score > previous_history.highest_score \
                else previous_history.highest_score
        else:
            db_clan_history.highest_score = clan.clan_score

        db_clan_history.save()

    def read_clan_members(self, db_clan, clan=None, clan_created=False):
        """
        Read all clan members and their stats
        :param Clan db_clan: the clan to read members from
        :param Box clan: data to be read
        :param clan_created: whether the clan was just created or not
        :return: None
        """
        if clan is None:
            clan = self.client.get_clan(db_clan.tag)

        read_players = []
        for player in clan.member_list:
            now = timezone.now()
            try:
                db_player = Player.objects.get(tag=player.tag[1:])
            except Player.DoesNotExist:
                db_player = Player(tag=player.tag[1:], name=player.name)
                db_player.save()

            read_players.append(db_player.tag)
            last_seen = timezone.make_aware(
                self.client.get_datetime(player.last_seen, unix=False),
                timezone=timezone.utc
            )
            history_args = {
                "clan": db_clan,
                "player": db_player,
                "clan_role": player.role,
                "donations": player.donations,
                "donations_received": player.donations_received,
                "last_seen": last_seen,
            }
            db_player_clanstats, created = PlayerClanStatsHistory.create_or_get(**history_args)
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
        actual_players = db_clan.get_players()
        now = timezone.now()
        if read_players or actual_players:
            # Check if each player in database is still in clan
            for p in actual_players:
                if p.tag not in read_players:  # Player left clan
                    pch, _ = PlayerClanHistory.create_or_get(player=p, clan=db_clan, left_clan__isnull=True)
                    pch.left_clan = now
                    pch.save()
                    self._log("Player #%s left clan" % p.tag)
            # Check if any player in clan is not in database
            for tag in read_players:
                _p = [x for x in actual_players if x.tag == tag]
                if len(_p) == 0:  # Player joined clan
                    player = Player.create_clan_history(tag, db_clan, clan_created, now=now)
                    self._log("Player #%s joined clan" % player.tag)

    def read_river_race_log(self, db_clan):
        """
        Read clan war log
        :param Clan db_clan: The clan to read war log from
        :return: None
        """
        wars = self.client.get_clan_river_race_log(db_clan.tag)
        for war in wars:
            created_time = self.get_datetime(war.created_date)

            db_war, created = ClanWar.objects.get_or_create(
                clan=db_clan,
                date_start=created_time,
                defaults=dict(date_start=created_time)
            )

            if not created and db_war.date_end is not None:
                break

            position = 0
            while war.standings[position].clan.tag[1:] != db_clan.tag:
                position += 1
            war_infos = war.standings[position]
            war_results = war_infos.clan

            for p in war_results.participants:
                db_p, _ = Player.objects.get_or_create(tag=p.tag[1:], defaults={'name': p.name})
                pcw, cpcw = PlayerClanWar.objects.get_or_create(clan_war=db_war, player=db_p)
                if cpcw:
                    pcw.fame = p.fame
                    pcw.repair_points = p.repair_points
                    pcw.save()

            db_war.is_river_race = True

            db_war.final_position = position + 1
            db_war.total_trophies = war_results.clan_score
            db_war.season = war.season_id
            db_war.date_end = self.get_datetime(war_results.finish_time)
            db_war.finish_time = created_time + timezone.timedelta(days=7)
            db_war.fame = war_results.fame
            db_war.repair_points = war_results.repair_points
            db_war.participants = len(war_results.participants)
            db_war.competitors_count = len(war.standings)
            db_war.save()

    def read_score_clan_ranks(self, db_clan, clan_stats=None):
        """
        Read global and local clan rank for clan trophies
        :param Clan db_clan: The clan to find ranks
        :param ClanHistory clan_stats: last known stats of the clan
        :return: None
        """
        if clan_stats is None:
            clan_stats = self._get_last_from_database(ClanHistory, clan=db_clan)

        local_rankings = self.client.get_top_clans(clan_stats.region_id)
        local_ranking = read_clan_ranking(local_rankings, db_clan.tag, clan_stats, 'local')
        if local_ranking:
            global_rankings = self.client.get_top_clans()
            read_clan_ranking(global_rankings, db_clan.tag, clan_stats, 'global')
            clan_stats.save()

    def read_war_clan_ranks(self, db_clan, clan_stats=None):
        """
        Read global and local clan rank for clan war trophies
        :param Clan db_clan: The clan to find ranks
        :param ClanHistory clan_stats: last known stats of the clan
        :return: None
        """
        if clan_stats is None:
            clan_stats = self._get_last_from_database(ClanHistory, clan=db_clan)

        local_rankings = self.client.get_top_clans(clan_stats.region_id)
        local_ranking = read_clan_ranking(local_rankings, db_clan.tag, clan_stats, 'local_war')
        if local_ranking:
            global_rankings = self.client.get_top_clans()
            read_clan_ranking(global_rankings, db_clan.tag, clan_stats, 'global_war')
            clan_stats.save()

    def read_clan_rank(self, db_clan, clan_stats=None):
        """
        Read global and local clan ranks for war trophies and trophies
        :param Clan db_clan: The clan to find ranks
        :param ClanHistory clan_stats: last known stats of the clan
        :return:
        """
        if clan_stats is None:
            clan_stats = self._get_last_from_database(ClanHistory, clan=db_clan)

        # Top clans by trophies
        self.read_score_clan_ranks(db_clan, clan_stats)
        self.read_war_clan_ranks(db_clan, clan_stats)
