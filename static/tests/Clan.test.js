import React from 'react'

import {
    render,
    waitFor,
    fireEvent,
    getByText,
    getAllByText,
    getByAltText,
    getAllByRole,
    queryByText,
} from './test-utils'
import "@testing-library/jest-dom/extend-expect"

import { CLAN_ROLES } from 'static/app/helpers/constants'

const clanMembers = [
    {
        tag: "1",
        name: "Bugs bunny",
        details: {
            clan_role: "leader",
            current_clan_rank: 1,
            donations: 0,
            donations_received: 42,
            level: 13,
            trophies: 9999,
            arena: 22,
            highest_trophies: 11111,
            highest_arena: 23,
            last_seen: new Date().toISOString()
        },
    },
    {
        tag: "2",
        name: "Daffy Duck",
        details: {
            clan_role: "coLeader",
            current_clan_rank: 3,
            donations: 0,
            donations_received: 100,
            level: 12,
            trophies: 6543,
            arena: 20,
            highest_trophies: 7654,
            highest_arena: 21,
            last_seen: new Date().toISOString()
        },
    },
    {
        tag: "R04D",
        name: "Road runner",
        details: {
            clan_role: "elder",
            current_clan_rank: 2,
            donations: 100,
            donations_received: 1,
            level: 13,
            trophies: 7777,
            arena: 21,
            highest_trophies: 7777,
            highest_arena: 21,
            last_seen: new Date().toISOString()
        },
    },
    {
        tag: "T4Z",
        name: "Taz",
        details: {
            clan_role: "member",
            current_clan_rank: 4,
            donations: 42,
            donations_received: 40,
            level: 10,
            trophies: 1234,
            arena: 6,
            highest_trophies: 1264,
            highest_arena: 6,
            last_seen: new Date().toISOString()
        },
    },
];

const clanInfos = {
    name: "The Looney Tunes",
    tag: 'ABCD',
    details: {
        badge: "https://example.com/flag.png",
        timestamp: new Date().toISOString(),
        last_refresh: new Date().toISOString(),
        score: 55555,
        trophies: 6666,
        member_count: clanMembers.length,
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
    war: {
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
    }
};

const clanWarInfos = {
    members: [
        {
            tag: clanMembers[0].tag,
            name: clanMembers[0].name,
            details: clanMembers[0].details,
            wars: [
                {
                    clan_war_id: 2,
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
                    clan_war_id: 1,
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
            ]
        },
        {
            tag: clanMembers[1].tag,
            name: clanMembers[1].name,
            details: clanMembers[1].details,
            wars: [
                {
                    clan_war_id: 2,
                    collections_battles: 0,
                    collections_battles_done: 3,
                    collections_battles_wins: 0,
                    collections_cards_earned: 600,
                    crowns: null,
                    final_battles: 2,
                    final_battles_done: 1,
                    final_battles_misses: 1,
                    final_battles_wins: 1,
                },
                {
                    clan_war_id: 1,
                    collections_battles: 0,
                    collections_battles_done: 3,
                    collections_battles_wins: 3,
                    collections_cards_earned: 1800,
                    crowns: null,
                    final_battles: 1,
                    final_battles_done: 1,
                    final_battles_misses: 0,
                    final_battles_wins: 0,
                }
            ]
        },
        { tag: clanMembers[2].tag, name: clanMembers[2].name, details: clanMembers[2].details, wars: []},
        {
            tag: clanMembers[3].tag,
            name: clanMembers[3].name,
            details: clanMembers[3].details,
            wars: [
                {
                    clan_war_id: 2,
                    collections_battles: 0,
                    collections_battles_done: 3,
                    collections_battles_wins: 3,
                    collections_cards_earned: 1800,
                    crowns: null,
                    final_battles: 1,
                    final_battles_done: 1,
                    final_battles_misses: 0,
                    final_battles_wins: 0,
                }
            ]
        },
    ],
    wars: [
        clanInfos.war,
        {
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
        }
    ]
}

const clanWeekly = clanMembers.map((e) => ({
    tag: e.tag,
    name: e.name,
    details: {
        arena: e.details.arena,
        donations: e.details.donations,
        donations_received: e.details.donations_received,
        level: e.details.level,
        timestamp: e.details.last_seen,
        trophies: e.details.trophies,
    },
}));

const clanSeason = clanMembers.map((e) => ({
    tag: e.tag,
    name: e.name,
    details: {
        ending: e.details.trophies,
        ending_arena: e.details.arena,
        highest: e.details.trophies,
        highest_arena: e.details.arena + 1,
        season__identifier: "2020-01",
    },
}));

describe('Clan page', () => {
    const subject = async (mockedData = {}) => {
        const rendered = render(
            '/clan/ABCD',
            {
                '/api/clan/ABCD/': { code: 200, response: clanInfos },
                '/api/clan/ABCD/members': { code: 200, response: clanMembers },
                '/api/clan/ABCD/wars': { code: 200, response: clanWarInfos },
                '/api/clan/ABCD/weekly': { code: 200, response: clanWeekly },
                '/api/clan/ABCD/season': { code: 200, response: clanSeason },
                ...mockedData
            },
        );
        await waitFor(() => expect(rendered.queryByAltText('Loading...')).not.toBeInTheDocument());
        return rendered;
    };

    describe('When there is no data', async () => {
        test("it doesn't render any table when no members are returned", async () => {
            const rendered = await subject({ '/api/clan/ABCD/members': { code: 200, response: [] } });
            rendered.getByText(clanInfos.name);
            expect(rendered.queryByRole('table')).not.toBeInTheDocument()
        });
        test("it doesn't render any table when no wars are returned", async () => {
            const rendered = await subject(
                { '/api/clan/ABCD/wars': {
                    code: 200,
                    response: {members: [], wars: [] }
                } }
            );
            fireEvent.click(rendered.getByText('War log'));
            rendered.getByText(clanInfos.name);
            expect(rendered.queryByRole('table')).not.toBeInTheDocument()
        });
        test("it doesn't render any table when no data is returned", async () => {
            const rendered = await subject({
                '/api/clan/ABCD/weekly': { code: 200, response: [] },
                '/api/clan/ABCD/season': { code: 200, response: [] },
            });
            fireEvent.click(rendered.getByText('Seasons'));
            rendered.getByText(clanInfos.name);
            expect(rendered.queryByRole('table')).not.toBeInTheDocument()
        });
    })

    describe('When there is data', async () => {
        test("it renders the clan details as card header", async () => {
            const rendered = await subject();
            const renderedClanInfos = rendered.getByTestId('clan details');
            expect(renderedClanInfos).toBeInTheDocument();
            getByText(renderedClanInfos, clanInfos.name)
            getByText(renderedClanInfos, clanInfos.details.description)
            getByText(renderedClanInfos, 'Last refresh a few seconds ago');
            getByText(renderedClanInfos, 'Score');
            getByText(renderedClanInfos, '6,666');
            getByText(renderedClanInfos, 'Trophies');
            getByText(renderedClanInfos, '55,555');
            getByText(renderedClanInfos, 'Members');
            getByText(renderedClanInfos, '4 / 50');
            getByText(renderedClanInfos, 'Region');
            // 1 for region and 2 for ranking (war & trophies)
            expect(getAllByText(renderedClanInfos, 'France').length).toBe(3);
            getByText(renderedClanInfos, 'Donations');
            getByText(renderedClanInfos, '2,222');
            // 1 per ranking (war & trophies)
            expect(getAllByText(renderedClanInfos, 'Global').length).toBe(2);
            getByText(renderedClanInfos, '5');
            getByText(renderedClanInfos, '1');
            getByText(renderedClanInfos, '3');
            getByText(renderedClanInfos, '1 (+2)');
        });
        test('it shows a tab component', async () => {
            const rendered = await subject();
            rendered.getByText('Clan members');
            rendered.getByText('War log');
            rendered.getByText('Seasons');
        });
        test("it renders an orderable table of members by default", async () => {
            const rendered = await subject();
            const [header, ...rows] = getAllByRole(rendered.getByRole('table'), 'row');
            getByText(header, "Rank");
            getByText(header, "Player");
            getByText(header, "Trophies");
            getByText(header, "Level");
            getByText(header, "Role");
            getByText(header, "Received");
            getByText(header, "Donated");
            getByText(header, "Total");

            const memberExpectations = (row, member) => {
                getByText(row, String(member.details.current_clan_rank));
                getByText(row, member.name);
                getByText(row, member.details.trophies.toLocaleString());
                getByText(row, String(member.details.level));
                getByText(row, CLAN_ROLES[member.details.clan_role]);
                getByText(row, String(member.details.donations_received));
                getByText(row, String(member.details.donations));
                getByText(row, String(member.details.donations - member.details.donations_received));
            }

            // Players are ordered by rank by default
            memberExpectations(rows[0], clanMembers[0]);
            memberExpectations(rows[1], clanMembers[2]);
            memberExpectations(rows[2], clanMembers[1]);
            memberExpectations(rows[3], clanMembers[3]);

            // Re-order by total donations (click 2 times for descending order)
            fireEvent.click(rendered.getByText('Total'));
            fireEvent.click(rendered.getByText('Total'));
            await waitFor(() => getByText(rendered.getAllByRole('row')[1], clanMembers[2].name))
            const [_, ...rowsByTotal] = rendered.getAllByRole('row');
            memberExpectations(rowsByTotal[0], clanMembers[2]);
            memberExpectations(rowsByTotal[1], clanMembers[3]);
            memberExpectations(rowsByTotal[2], clanMembers[1]);
            memberExpectations(rowsByTotal[3], clanMembers[0]);
        });
        test("it renders an orderable table of members and wars in war log section", async () => {
            const rendered = await subject();
            fireEvent.click(rendered.getByText('War log'));
            await waitFor(() => rendered.getByRole('table'))

            const [header, ...rows] = rendered.getAllByRole('row');
            expect(rendered.getAllByRole('columnheader').length).toBe(8)
            getByAltText(header, "Trophies");
            getByText(header, "Name");
            getByText(header, "Role");
            getByText(header, "Win %");
            getByAltText(header, "Battles");
            getByAltText(header, "Battles missed");
            getByText(header, "05/12");
            getByText(header, "03/12");

            const memberExpectations = (row, member) => {
                const cells = getAllByRole(row, 'cell');
                const wins = member.wars.reduce((acc, elem) => acc + elem.final_battles_wins, 0);
                const battles = member.wars.reduce((acc, elem) => acc + elem.final_battles_done, 0);
                const winRate = battles > 0 ? (wins / battles) * 100 : -1;

                getByText(cells[0], member.details.trophies.toLocaleString());
                getByText(cells[1], member.name);
                getByText(cells[2], CLAN_ROLES[member.details.clan_role]);
                const winRateElement = queryByText(
                    cells[3],
                    `${ winRate.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }%`
                );
                if (winRate >= 0)
                    expect(winRateElement).toBeInTheDocument();
                else
                    expect(winRateElement).not.toBeInTheDocument();
                getByText(cells[4], String(battles));
                getByText(cells[5], String(member.wars.reduce((acc, elem) => acc + elem.final_battles_misses, 0)));
            }

            // Players are ordered by trophies by default
            memberExpectations(rows[0], clanWarInfos.members[0]);
            memberExpectations(rows[1], clanWarInfos.members[2]);
            memberExpectations(rows[2], clanWarInfos.members[1]);
            memberExpectations(rows[3], clanWarInfos.members[3]);

            // Re-order by name (click 2 times for descending order)
            fireEvent.click(rendered.getByAltText('Battles'));
            fireEvent.click(rendered.getByAltText('Battles'));
            await waitFor(() => getByText(rendered.getAllByRole('row')[2], clanWarInfos.members[1].name))
            const [_, ...rowsByTotal] = rendered.getAllByRole('row');
            memberExpectations(rowsByTotal[0], clanWarInfos.members[0]);
            memberExpectations(rowsByTotal[1], clanWarInfos.members[1]);
            memberExpectations(rowsByTotal[2], clanWarInfos.members[3]);
            memberExpectations(rowsByTotal[3], clanWarInfos.members[2]);
        });
        test("it renders one table for previous season and another for previous week in seasons section", async () => {
            const rendered = await subject();
            fireEvent.click(rendered.getByText('Seasons'));
            await waitFor(() => rendered.getByText('Previous week'));
            const [weekTable, seasonTable] = rendered.getAllByRole('table');
            const [weekTableHeader, ...weekTableRows] = getAllByRole(weekTable, 'row')
            getByText(weekTableHeader, 'Player');
            getByText(weekTableHeader, 'Trophies');
            getByText(weekTableHeader, 'Received');
            getByText(weekTableHeader, 'Donated');
            getByText(weekTableHeader, 'Total');
            expect(weekTableRows.length).toBe(4);
        })
    })
})
