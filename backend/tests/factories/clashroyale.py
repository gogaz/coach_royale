import random

from django.utils import timezone

from backend.models import (
    Clan,
    ClanHistory,
    ClanWar,
    Player,
    PlayerClanWar,
    PlayerStatsHistory,
    PlayerClanHistory,
    PlayerClanStatsHistory
)

from .base import Factory


class ClanFactory(Factory):
    @classmethod
    def create(cls, with_history=False, **kwargs):
        tag = kwargs.pop('tag', cls.random_tag())
        clan = Clan.objects.create(
            name=kwargs.pop('name', 'Clan ' + tag),
            tag=tag
        )
        if with_history:
            ClanHistoryFactory.create(clan=clan, **kwargs)

        return clan


class ClanHistoryFactory(Factory):
    NAMES = ['pros', 'gods', 'heroes', 'kings', 'warriors', 'gangstas', 'hack3rs', 'noobs']

    @classmethod
    def create(cls, **kwargs):
        clan = kwargs.get('clan', ClanFactory.create(**kwargs))
        description = kwargs.pop('description', 'A clan of ' + random.choice(cls.NAMES))
        return ClanHistory.objects.create(
            clan=clan,
            score=kwargs.pop('score', 50000),
            highest_score=kwargs.pop('highest_score', 55000),
            required_trophies=kwargs.pop('required_trophies', 4000),
            type=kwargs.pop('type', 'open'),
            description=description,
            member_count=kwargs.pop('member_count', 50),
            donations=kwargs.pop('donations', 15000),
            region=kwargs.pop('region', 'France'),
            region_code=kwargs.pop('region_code', 'FR'),
            badge=kwargs.pop('badge', 'some_badge'),
            trophies=kwargs.pop('trophies', 50000),
            prev_local_rank=kwargs.pop('prev_local_rank', 999),
            local_rank=kwargs.pop('local_rank', 999),
            prev_global_rank=kwargs.pop('prev_global_rank', 999),
            global_rank=kwargs.pop('global_rank', 999),
            prev_local_war_rank=kwargs.pop('prev_local_war_rank', 999),
            local_war_rank=kwargs.pop('local_war_rank', 999),
            prev_global_war_rank=kwargs.pop('prev_global_war_rank', 999),
            global_war_rank=kwargs.pop('global_war_rank', 999),
        )


class PlayerFactory(Factory):
    @classmethod
    def create(cls, with_history=False, **kwargs):
        tag = kwargs.pop('tag', cls.random_tag())
        player = Player.objects.create(
            name=kwargs.pop('name', 'Player ' + tag),
            tag=tag
        )

        if with_history:
            PlayerHistoryFactory.create(player=player, **kwargs)

        return player


class PlayerHistoryFactory(Factory):
    @classmethod
    def create(cls, with_clan=False, with_war=False, **kwargs):
        psh = PlayerStatsHistoryFactory.create(**kwargs)
        pch = None
        pcsh = None
        pcw = None
        clan = kwargs.pop('clan', ClanFactory.create(**kwargs))
        if with_clan:
            trophies = kwargs.pop('current_trophies', psh.current_trophies)
            pch = PlayerClanHistoryFactory.create(clan=clan, **kwargs)
            pcsh = PlayerClanStatsHistoryFactory.create(
                clan=clan,
                trophies=trophies,
                **kwargs
            )

        if with_war:
            pcw = PlayerClanWarFactory.create(clan=clan, **kwargs)

        return psh, pch, pcsh, pcw


class PlayerStatsHistoryFactory(Factory):
    @classmethod
    def create(cls, **kwargs):
        level = kwargs.get('level', 13)
        trophies = kwargs.get('current_trophies', level * random.randint(300, 500))
        timestamp = kwargs.pop('timestamp', timezone.now())
        return PlayerStatsHistory.objects.create(
            player=kwargs.get('player', PlayerFactory.create(**kwargs)),
            level=level,
            total_donations=kwargs.pop('total_donations', level * 8000),
            highest_trophies=kwargs.pop('highest_trophies', trophies + 300),
            current_trophies=kwargs.pop('current_trophies', trophies),
            challenge_cards_won=kwargs.pop('challenge_cards_won', level * 1000),
            tourney_cards_won=kwargs.pop('tourney_cards_won', level * 1000),
            cards_found=kwargs.pop('cards_found', level * 6),
            favorite_card=kwargs.pop('favorite_card', 'fireball'),
            arena=kwargs.pop('arena', level + 3),
            total_games=kwargs.pop('total_games', level * 600),
            tournament_games=kwargs.pop('tournament_games', level * 1234),
            wins=kwargs.pop('wins', level * 200),
            losses=kwargs.pop('losses', level * 200),
            draws=kwargs.pop('draws', level * 200),
            win_3_crowns=kwargs.pop('win_3_crowns', level * 50),
            clan_cards_collected=kwargs.pop('clan_cards_collected', level * 1000),
            war_day_wins=kwargs.pop('war_day_wins', (level + 3) * 10),
            timestamp=timestamp,
            last_refresh=kwargs.pop('last_refresh', timestamp)
        )


class PlayerClanHistoryFactory(Factory):
    @classmethod
    def create(cls, **kwargs):
        return PlayerClanHistory.objects.create(
            clan=kwargs.get('clan', ClanFactory.create(**kwargs)),
            player=kwargs.get('player', PlayerFactory.create(**kwargs)),
            joined_clan=kwargs.pop('joined_clan', None),
            left_clan=kwargs.pop('left_clan', None)
        )


class PlayerClanStatsHistoryFactory(Factory):
    @classmethod
    def create(cls, **kwargs):
        level = kwargs.pop('level', random.randint(9, 13))
        return PlayerClanStatsHistory.objects.create(
            clan=kwargs.get('clan', ClanFactory.create(**kwargs)),
            player=kwargs.get('player', PlayerFactory.create(**kwargs, level=level)),
            clan_role=kwargs.pop('clan_role', 'member'),
            current_clan_rank=kwargs.pop('current_clan_rank', 20 - level),
            previous_clan_rank=kwargs.pop('previous_clan_rank', 25 - level),
            donations=kwargs.pop('donations', 0),
            donations_received=kwargs.pop('donations_received', 0),
            last_seen=kwargs.pop('last_seen', timezone.now() - timezone.timedelta(hours=(14 - level) * 3)),
            level=level,
            trophies=kwargs.pop('trophies', level * 400),
            arena=kwargs.pop('arena', level * 3),
        )


class PlayerClanWarFactory(Factory):
    @classmethod
    def create(cls, **kwargs):
        return PlayerClanWar.objects.create(
            clan_war=kwargs.pop('clan_war', ClanWarFactory.create(**kwargs)),
            player=kwargs.get('player', PlayerFactory.create(**kwargs)),
            fame=kwargs.pop('fame', 1000),
            repair_points=kwargs.pop('repair_points', 208),
        )


class ClanWarFactory(Factory):
    @classmethod
    def create(cls, **kwargs):
        participants = kwargs.pop('participants', random.randint(25, 40))
        date_start = kwargs.pop('date_start', timezone.now())
        return ClanWar.objects.create(
            clan=kwargs.get('clan', ClanFactory.create(**kwargs)),
            date_start=date_start,
            date_end=kwargs.pop('date_end', date_start + timezone.timedelta(days=2)),
            participants=kwargs.pop('participants', participants),
            final_battles=kwargs.pop('final_battles', participants - int(participants / 10)),
            collections_battles=kwargs.pop('collections_battles', int(participants * 2.5)),
            wins=kwargs.pop('wins', int(participants / 2)),
            losses=kwargs.pop('losses', int(participants / 2) - int(participants / 10)),
            collections_cards=kwargs.pop('collections_cards', participants * 1500),
            crowns=kwargs.pop('crowns', int(participants * 1.5)),
            final_position=kwargs.pop('final_position', 2),
            total_trophies=kwargs.pop('total_trophies', participants * 200),
            trophies=kwargs.pop('trophies', int(participants / 2) + 50),
            season=kwargs.pop('season', 1),
            fame=kwargs.pop('fame', 1000),
            repair_points=kwargs.pop('repair_points', 208),
            finish_time=kwargs.pop('finish_time', date_start + timezone.timedelta(weeks=1)),
            is_river_race=True,
            competitors_count=kwargs.pop('competitors_count', 5)
        )
