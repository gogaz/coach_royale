import React, { useContext, useEffect, useState } from 'react';
import moment from 'moment';
import styled from "styled-components";
import axios from "axios";

import { ConstantsContext, playerArenaFromTrophies } from "../../helpers/constants";
import { handleErrors } from "../../helpers/api";
import { images } from "../../helpers/assets";

import ClashRoyaleStat from "../ui/ClashRoyaleStat";
import Loading from "../ui/Loading";
import PlayersClan from "./PlayersClan";
import LastRefreshInfo from "../ui/LastRefreshInfo";
import { setTitle } from "../../helpers/browser";
import ReactTooltip from "react-tooltip";
import TimeFromNow from "../ui/TimeFromNow";

const CardContainer = styled.div`
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
    const [loading, setLoading] = useState(true);
    const [player, setPlayer] = useState(null);
    const [highestArenaImage, setHighestArenaImage] = useState(null);
    const constants = useContext(ConstantsContext);

    useEffect(() => {
        setTitle("Player's profile");
        axios.get(endpoint + '/')
            .then((res) => handleErrors(res))
            .then(
                (result) => {
                    setPlayer(result);
                    constants.then((constants) => {
                        setHighestArenaImage(playerArenaFromTrophies(constants, result.details.highest_trophies))
                    });
                    setLoading(false);
                    setTitle(`${ result.name } (#${ result.tag })`);
                })
            .catch(error => console.log(error));
    }, [endpoint]);

    if (loading) return <Loading/>;

    const lastSeen = moment(player.clan.last_seen);
    const LastSeen = (...args) => (
        <React.Fragment>
            <span data-tip data-for="lastSeen"><TimeFromNow time={ lastSeen }/></span>
            <ReactTooltip type="dark" effect="solid"
                          id="lastSeen">{ lastSeen.format('L') } { lastSeen.format('LTS') }</ReactTooltip>
        </React.Fragment>
    );

    return (
        <React.Fragment>
            <div className="card-header">
                <div className="row">
                    <div className="col-7">
                        <h3 className="d-inline mr-2">{ player.name }</h3>
                        <LastRefreshInfo time={ player.details.last_refresh }/>
                        <PlayersClan player={ player }/>
                    </div>
                    { player.clan.details && (
                        <div className="col-5">
                            <img src={ player.clan.details.badge } style={ { float: 'right', height: '5pc' } }/>
                        </div>
                    ) }
                </div>
                <div className="mt-1 ml-md-3 ml-1" hidden={ player.details.last_refresh !== null }>
                    No more information available
                </div>
            </div>
            <CardContainer>
                <ClashRoyaleStat title="Last seen" image={ images.static('activity') }
                                 value={ <LastSeen/> }/>
                <ClashRoyaleStat title="Trophies"
                                 image={ player.details.current_trophies > 4000 ? images.arena(player.details.arena) : images.static('trophy') }
                                 value={ player.details.current_trophies }/>
                <ClashRoyaleStat title="Highest"
                                 image={ images.arena(highestArenaImage) }
                                 value={ player.details.highest_trophies }/>
                <ClashRoyaleStat title="War wins" image={ images.static('warWon') }
                                 value={ player.details.war_day_wins }/>
                <ClashRoyaleStat title="Cards found" image={ images.static('cards') }
                                 value={ player.details.cards_found }/>
            </CardContainer>
            <hr style={ { marginBottom: 0 } }/>
        </React.Fragment>
    );
};

export default PlayerStats;