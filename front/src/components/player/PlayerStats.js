import React from 'react';
import moment from 'moment'
import styled from "styled-components";

import {ConstantsContext, playerArenaFromTrophies} from "../../helpers/constants";
import {handleErrors} from "../../helpers/api";
import '../../helpers/constants'
import {images} from "../../helpers/assets";

import ClashRoyaleStat from "../ui/ClashRoyaleStat";
import Loading from "../ui/Loading";
import PlayersClan from "./PlayersClan";
import LastRefreshInfo from "../ui/LastRefreshInfo";
import {setTitle} from "../../helpers/browser";
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


export default class PlayerStats extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loadingPlayer: true,
            loadingClan: true,
            player: {details: {}}
        };

        this.fetchPlayerData = this.fetchPlayerData.bind(this);
        this.fetchClanData = this.fetchClanData.bind(this)
    }

    fetchPlayerData() {
        setTitle("Player's profile");
        fetch(this.props.endpoint + '/')
            .then((res) => handleErrors(res))
            .then(
                (result) => {
                    console.log(result);
                    this.setState({loadingPlayer: false, player: result});
                    setTitle(`${result.name} (#${result.tag})`);
                    this.fetchClanData();
                })
            .catch(error => console.log(error));
    }

    fetchClanData() {
        fetch(this.props.endpoint + '/clan')
            .then((res) => handleErrors(res))
            .then(
                (result) => {
                    console.log(result);
                    this.setState({loadingClan: false, player: {...this.state.player, clanDetails: result}});
                })
            .catch(error => console.log(error));
    }

    componentDidMount() {
        this.fetchPlayerData();
    }

    render() {
        const {loadingPlayer, loadingClan, player} = this.state;

        if (loadingPlayer || loadingClan) return <Loading/>;


        return (
            <React.Fragment>
                <div className="card-header">
                    <div className="row">
                        <div className="col-7">
                            <h3 className="d-inline mr-2">{player.name}</h3>
                            <LastRefreshInfo time={player.details.last_refresh}/>
                            <PlayersClan player={player}/>
                        </div>
                        <div className="col-5">
                            <img src={player.clan.details.badge} style={{float: 'right', height: '5pc'}}/>
                        </div>
                    </div>
                    <div className="mt-1 ml-md-3 ml-1" hidden={player.details.last_refresh !== null}>
                        No more information available
                    </div>
                </div>
                <CardContainer>
                    <ClashRoyaleStat title="Last seen" image={images.static('activity')}
                                     value={moment(player.details.last_refresh).fromNow()}/>
                    <ClashRoyaleStat title="Trophies"
                                     image={player.details.current_trophies > 4000 ? images.arena(player.details.arena) : images.static('trophy')}
                                     value={player.details.current_trophies}/>
                    <ClashRoyaleStat title="Highest"
                                     image={images.arena(playerArenaFromTrophies(this.context, player.details.current_trophies))}
                                     value={player.details.highest_trophies}/>
                    <ClashRoyaleStat title="War wins" image={images.static('warWon')}
                                     value={player.details.war_day_wins}/>
                    <ClashRoyaleStat title="Cards found" image={images.static('cards')}
                                     value={player.details.cards_found}/>
                </CardContainer>
                <hr style={{marginBottom: 0}}/>
            </React.Fragment>
        );
    }
}
PlayerStats.contextType = ConstantsContext;