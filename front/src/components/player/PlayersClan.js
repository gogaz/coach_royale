import React from 'react';
import moment from 'moment'
import {Link} from "react-router-dom";
import styled, { withTheme } from "styled-components";

import DonationCell from "../clan/cells/DonationCell";

const PlayerClanInfo = styled.div`
    display: inline-block;
    
    .donations-icons svg {
        font-size: .5rem;
        top: 0;
        margin-top: .69rem;
    }
`;

const Data = styled.span`
    border-left: 1px solid #c2cfd6;
    padding-left: 8px;
    padding-right: 8px;
    color: ${({theme}) => theme.colors.gray}!important;
`;

const PlayersClan = ({player}) => {
    const roles = {elder: 'Elder', coLeader: "Co-Leader", leader: "Leader", member: "Member"};

    return (
        <div className="mt-3">
            <span className="mr-2"><Link to={"/clan/" + player.clan.tag}>{player.clan.name}</Link></span>
            <PlayerClanInfo>
                <Data>{roles[player.clanDetails.clan_role]}</Data>
                <Data>#{player.clanDetails.current_clan_rank}</Data>
                <Data>
                    <DonationCell row={player} icon="arrow-up" color="success" column="donations"/>
                </Data>
                <Data>
                    <DonationCell row={player} icon="arrow-down" color="danger" column="donations_received"/>
                </Data>
                {player.clanDetails.joined &&
                    <Data>Joined {moment(player.clanDetails.joined).calendar()}</Data>
                }
            </PlayerClanInfo>
        </div>
    );
};

export default withTheme(PlayersClan);