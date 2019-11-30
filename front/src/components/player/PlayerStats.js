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
            loading: true,
            player: {details: {}}
        };

        this.fetchData = this.fetchData.bind(this);
    }

    fetchData() {
        fetch(this.props.endpoint + '/')
            .then((res) => handleErrors(res))
            .then(
                (result) => {
                    this.setState({loading: false, player: result});
                })
            .catch(error => console.log(error));
    }

    componentDidMount() {
        this.fetchData();
    }

    render() {
        const {loading, player} = this.state;

        if (loading) return <Loading/>;

        return (
            <React.Fragment>
                <div className="card-header">
                    <div className="row">
                        <div className="col-7">
                            <h3 className="d-inline mr-2">{player.name}</h3>
                            <LastRefreshInfo time={player.details.last_refresh}/>
                            <PlayersClan clan={player.clan} endpoint={this.props.endpoint}/>
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
                <hr/>
            </React.Fragment>
        );
    }
}
PlayerStats.contextType = ConstantsContext;