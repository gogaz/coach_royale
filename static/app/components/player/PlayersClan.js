import React from 'react';
import moment from 'utils/moment'
import { Link } from 'react-router-dom'
import styled, { withTheme } from 'styled-components'

import DonationCell from 'components/clan/cells/DonationCell'
import FontAwesomeIcon from 'components/ui/FontAwesome'

const PlayerClanInfo = styled.div`
    display: inline-block;
    color: ${ ({ theme }) => theme.colors.gray }!important;
    
    .donations-icons svg {
        font-size: .5rem;
        top: 0;
        margin-top: .69rem;
    }
`;

const Data = styled.span`
    &:not(:first-child) {
        border-left: 1px solid ${ ({ theme }) => theme.colors.lightGray };
    }
    
    &:not(:only-child) {
        padding-left: 8px;
        padding-right: 8px;
    }
`;

const PlayersClan = ({ theme, player }) => {
    const roles = { elder: 'Elder', coLeader: "Co-Leader", leader: "Leader", member: "Member" };
    const { dates_in_clan: { joined_clan, left_clan }, clan_role, current_clan_rank, clan } = player.clan;

    if (left_clan)
        return (
            <PlayerClanInfo>
                Left <Link to={ `/clan/${ clan.tag }` }>{ clan.name }</Link>
                <FontAwesomeIcon color={ theme.colors.gray } icon='sign-out-alt'/>
                { moment(left_clan).calendar() }
            </PlayerClanInfo>
        );

    return (
        <div className="mt-1">
            <PlayerClanInfo>
                <Data><Link to={ `/clan/${ clan.tag }` }>{ clan.name }</Link></Data>
                <Data>{ roles[clan_role] }</Data>
                <Data>#{ current_clan_rank }</Data>
                <Data>
                    <DonationCell row={ player } icon="arrow-up" color="success" column="donations"/>
                </Data>
                <Data>
                    <DonationCell row={ player } icon="arrow-down" color="danger" column="donations_received"/>
                </Data>
                { joined_clan && <Data>Joined on { moment(joined_clan).calendar() }</Data> }
            </PlayerClanInfo>
        </div>
    );
};

export default withTheme(PlayersClan);
