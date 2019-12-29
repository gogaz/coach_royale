import React from 'react'
import { render, wait } from '../test-utils'
import "@testing-library/jest-dom/extend-expect"
import App from "../../src/components/App";
import mock from "../axiosMock";
import ClanDetails from "../../src/components/clan/ClanDetails";

const members = [
    {
        tag: "1",
        name: "Bugs bunny",
        details: {
            clan_role: "leader",
            current_clan_rank: 1,
            donations: 0,
            donations_received: 0,
            level: 13,
            trophies: 9999,
            arena: 22,
            last_seen: new Date().toISOString()
        },
    },
];

const clanInfos = {
    name: "The Looney Tunes",
    tag: 'ABCD',
    details: {
        timestamp: new Date().toISOString(),
        last_refresh: new Date().toISOString(),
        score: 55555,
        trophies: 6666,
        member_count: members.length,
        donations: 2222,
        region: "France",
        region_code: "FR",
        description: "Bugs bunny, bip bip, coyote and all their friends are here!",
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
        id: 21,
        date_start: "2019-12-13T21:58:58.000000Z",
        date_end: "2019-12-15T21:58:58.000000Z",
        participants: 24,
        final_battles: 23,
        collections_battles: null,
        collections_cards: null,
        wins: 11,
        losses: 12,
        crowns: 21,
        final_position: 1,
        trophies: 111,
        total_trophies: 6651,
        season: 44
    }
};

const subject = () => {
    mock.onGet('/constants/arenas.json')
        .reply(200, [])
        .onGet('/api/clan/ABCD/')
        .reply(200, clanInfos)
        .onGet('/api/clan/ABCD/members')
        .reply(200, members);

    return render(<ClanDetails endpoint={'/api/clan/ABCD'} data={clanInfos}/>, {}, { route: '/clan/ABCD' });
    //await wait(() => rendered.getByText(clanInfos.name));
};

describe("Clan members page", () => {
    test("it renders the clan details as card header", async () => {
        const rendered = subject();
        await wait(() => rendered.getByText(clanInfos.name));
        expect(rendered.queryByText(clanInfos.details.trophies)).toBe(true);
        rendered.getByText(clanInfos.details.trophies);
    });
    test("it renders list of members in a react-table", async () => {
        const rendered = subject();
        await wait(() => rendered.getByText(clanInfos.name));
        rendered.getByText(clanInfos.name);
        rendered.getByText(clanInfos.details.trophies);
    });
});
