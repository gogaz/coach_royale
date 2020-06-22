import React from 'react'

import {
    render,
    wait,
    fireEvent,
    getByText,
    getAllByText,
    getByAltText,
    getAllByRole,
    queryByText,
} from '../test-utils'
import "@testing-library/jest-dom/extend-expect"

const playerWars = [
    {
        clan_war: {
            id: 2,
            date_start: "2019-12-03T00:00:00.000000Z",
            date_end: "2019-12-01T00:00:00.000000Z",
            participants: 4,
            final_battles: 3,
            collections_battles: null,
            collections_cards: null,
            wins: 2,
            losses: 1,
            crowns: 5,
            final_position: 1,
            trophies: 102,
            total_trophies: 6651,
            season: 42,
        },
        collections_battles: 0,
        collections_battles_done: 3,
        collections_battles_wins: 3,
        collections_cards_earned: 1800,
        crowns: null,
        final_battles: 2,
        final_battles_done: 2,
        final_battles_misses: 0,
        final_battles_wins: 1,
    },
    {
        clan_war: {
            id: 1,
            date_start: "2019-12-05T01:00:00.000000Z",
            date_end: "2019-12-03T01:00:00.000000Z",
            participants: 4,
            final_battles: 3,
            collections_battles: null,
            collections_cards: null,
            wins: 2,
            losses: 1,
            crowns: 5,
            final_position: 5,
            trophies: -98,
            total_trophies: 6549,
            season: 42,
        },
        collections_battles: 0,
        collections_battles_done: 3,
        collections_battles_wins: 3,
        collections_cards_earned: 1800,
        crowns: null,
        final_battles: 1,
        final_battles_done: 1,
        final_battles_misses: 0,
        final_battles_wins: 1,
    }
];

const playerInfos = {
    tag: "1",
    name: "Bugs bunny",
    details: {
        level: 13,
        arena: 22,
        cards_found: 100,
        challenge_cards_won: 90000,
        clan_cards_collected: 200000,
        current_trophies: 9999,
        draws: 3333,
        favorite_card: "tesla",
        highest_trophies: 11111,
        last_refresh: new Date().toISOString(),
        losses: 6147,
        timestamp: new Date().toISOString(),
        total_donations: 123456,
        total_games: 20000,
        tournament_games: 7890,
        tourney_cards_won: 1234,
        war_day_wins: 99,
        win_3_crowns: 8888,
        wins: 10000,
    },
    clan: {
        clan_role: "leader",
        current_clan_rank: 1,
        dates_in_clan: {
            joined_clan: new Date().toISOString(),
            left_clan: null
        },
        donations: 0,
        donations_received: 42,
        last_seen: new Date().toISOString(),
        last_refresh: new Date().toISOString(),
        timestamp: new Date().toISOString(),
        clan: {
            name: "The Looney Tunes",
            tag: 'ABCD',
            details: {
                badge: "https://example.com/flag.png",
                timestamp: new Date().toISOString(),
                last_refresh: new Date().toISOString(),
                score: 55555,
                trophies: 6666,
                member_count: 4,
                donations: 2222,
                region: "France",
                region_code: "FR",
                description: "Bugs bunny, road runner, coyote and all their friends are here!",
                prev_local_rank: 3,
                local_rank: 1,
                prev_global_rank: 2,
                global_rank: 1,
                prev_global_war_rank: 2,
                global_war_rank: 5,
                prev_local_war_rank: 2,
                local_war_rank: 3
            },
            war: { ...playerWars[0], clan_war: null, clan_war_id: 2 },
        }
    }
};

const playerActivity = {
    wars: playerWars,
    war_stats: {
        availables: playerWars.reduce((acc, e) => acc + e.final_battles, 0),
        battles: playerWars.reduce((acc, e) => acc + e.final_battles_done, 0),
        wins: playerWars.reduce((acc, e) => acc + e.final_battles_wins, 0),
    },
    stats: [
        {
            current_trophies: playerInfos.details.current_trophies,
            draws: playerInfos.details.draws,
            losses: playerInfos.details.losses,
            timestamp: playerInfos.details.timestamp,
            total_donations: playerInfos.details.total_donations,
            total_games: playerInfos.details.total_games,
            wins: playerInfos.details.wins,
        }
    ],
}

const subject = async (mockedData = {}) => {
    const rendered = render(
        '/player/1',
        {
            '/api/player/1/': { code: 200, response: playerInfos },
            '/api/player/1/activity': { code: 200, response: playerActivity },
            ...mockedData
        },
    );
    await wait(() => rendered.getByText(playerInfos.name));
    return rendered;
};

describe('Player page', () => {
    test('it shows player details in card header', async () => {
        const rendered = await subject();
        rendered.getByText('Last refresh a few seconds ago');
        rendered.getByText(playerInfos.clan.clan.name);
        rendered.getByText('Leader');
        rendered.getByText('#1');
    });
    test('it shows a table of wars', async () => {
        const rendered = await subject();
        rendered.getByRole('table');
        const [header, ...rows] = rendered.getAllByRole('row');
        getByText(header, 'War');
        getByText(header, 'Result');
        expect(rows.length).toBe(2);
    });
    test('it show a doughnut chart of war battles', async () => {
        const rendered = await subject();
        const charts = rendered.getAllByRole('chart');
        getByText(charts[0], 'Player wars')
    });
    test('it show a charts with player activity', async () => {
        const rendered = await subject();
        const charts = rendered.getAllByRole('chart');
        getByText(charts[0], 'Player wars');
        getByText(charts[1], 'Trophies');
        getByText(charts[2], 'Player battles');
    })
})