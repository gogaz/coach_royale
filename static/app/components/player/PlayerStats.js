import React, { useContext, useEffect, useState } from 'react';
import moment from 'moment';
import styled from "styled-components";

import { ConstantsContext } from "../../helpers/constants";
import { images } from "../../helpers/assets";

import ClashRoyaleStat from "../ui/ClashRoyaleStat";
import Loading from "../ui/Loading";
import PlayersClan from "./PlayersClan";
import LastRefreshInfo from "../ui/LastRefreshInfo";
import { setTitle, useFetch } from "../../helpers/browser";
import ReactTooltip from "react-tooltip";
import TimeFromNow from "../ui/TimeFromNow";
import { Header } from "../ui/Card";
import { Flex, FlexWrapper } from "../ui/Disposition";

const CardsContainer = styled.div`
    margin-top: .75rem;
    margin-left: 1.25rem;
    display: grid;
    row-gap: 10px;
    
    @media (max-width: 425px) {
        grid-template-columns: repeat(2, 1fr);
    }
    @media (min-width: 425px) {
        grid-template-columns: repeat(3, 1fr);
    }
    @media (min-width: 750px) {
        grid-template-columns: repeat(5, 1fr);
    }
    @media (min-width: 1170px) {
        grid-template-columns: repeat(8, minmax(125px, 1fr));
    }
`;


const PlayerStats = ({ endpoint }) => {
    const { loading, data: player } = useFetch(
        endpoint + '/',
        null,
        (p) => setTitle(`${ p.name } (#${ p.tag })`)
    );
    const { playerArenaFromTrophies } = useContext(ConstantsContext);

    if (loading) return <Loading/>;

    const lastSeen = moment(player.clan.last_seen);
    const LastSeen = () => (
        <React.Fragment>
            <span data-tip data-for="lastSeen"><TimeFromNow time={ lastSeen }/></span>
            <ReactTooltip type="dark" effect="solid"
                          id="lastSeen">{ lastSeen.format('L') } { lastSeen.format('LTS') }</ReactTooltip>
        </React.Fragment>
    );

    return (
        <React.Fragment>
            <Header>
                <FlexWrapper direction="row">
                    <Flex grow={9}>
                        <h3 className="d-inline mr-2">{ player.name }</h3>
                        <LastRefreshInfo time={ player.details.last_refresh }/>
                        <PlayersClan player={ player }/>
                    </Flex>
                    { player.clan.clan.details && (
                        <Flex grow={3}>
                            <img
                                src={ player.clan.clan.details.badge }
                                style={ { float: 'right', height: '5pc' } }
                                alt="Clan badge"
                            />
                        </Flex>
                    ) }
                </FlexWrapper>
            </Header>
            <CardsContainer>
                <ClashRoyaleStat title="Last seen" image={ images.static('activity') }
                                 value={ <LastSeen/> }/>
                <ClashRoyaleStat title="Trophies"
                                 image={ player.details.current_trophies > 4000 ? images.arena(player.details.arena) : images.static('trophy') }
                                 value={ player.details.current_trophies }/>
                <ClashRoyaleStat title="Highest"
                                 image={ images.arena(playerArenaFromTrophies(player.details.highest_trophies)).arena }
                                 value={ player.details.highest_trophies }/>
                <ClashRoyaleStat title="War wins" image={ images.static('warWon') }
                                 value={ player.details.war_day_wins }/>
                <ClashRoyaleStat title="Cards found" image={ images.static('cards') }
                                 value={ player.details.cards_found }/>
            </CardsContainer>
            <hr style={ { marginBottom: 0 } }/>
        </React.Fragment>
    );
};

export default PlayerStats;