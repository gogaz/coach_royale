import React from 'react';
import { images } from "../../helpers/assets";
import ClashRoyaleStat from "../ui/ClashRoyaleStat";
import Loading from "../ui/Loading";
import { handleErrors, playerLeagueFromTrophies } from "../../helpers/api";
import PlayersClan from "./PlayersClan";
import LastRefreshInfo from "../ui/LastRefreshInfo";

export default class PlayerStats extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            player: {details:{}}
        };

        this.fetchData = this.fetchData.bind(this);
    }
    fetchData() {
        fetch(this.props.endpoint)
            .then((res) => handleErrors(res))
            .then(
                (result) => {
                    console.log(result);
                    this.setState({ loading: false, player: result });
                })
            .catch(error => console.log(error) );
    }
    componentDidMount() {
        this.fetchData();
    }
    render() {
        const { loading, player} = this.state;

        if (loading) return <Loading/>;

        return (
            <div className="card-header">
                <div className="row">
                    <div className="col-7">
                        <h3 className="d-inline mr-2">{player.name}</h3>
                        <LastRefreshInfo time={player.details.last_refresh}/>
                        <PlayersClan clan={player.clan} endpoint={this.props.endpoint}/>
                    </div>
                    <div className="col-5">
                        <img src={player.clan.details.badge} style={{ float: 'right', height: '5pc' }} />
                    </div>
                </div>
                <div className="row mt-1 ml-md-3 ml-1" hidden={player.details.last_refresh !== null}>
                    No more information available {/*<a className="btn" onClick={() => this.forceRefresh()}><FontAwesomeIcon icon={"sync"}/> Refresh</a>*/}
                </div>
                <div className="row mt-1" hidden={player.details.last_refresh === null}>
                    <ClashRoyaleStat title="Trophies"
                                     image={player.details.current_trophies > 4000 ? images.arenaX(player.details.arena) : images.trophy}
                                     value={player.details.current_trophies} />
                    <ClashRoyaleStat title="Highest"
                                     image={player.details.highest_trophies > 4000 ?
                                         images.leagueX(playerLeagueFromTrophies(player.details.highest_trophies)) : images.trophyRibbon}
                                     value={player.details.highest_trophies} />
                    <ClashRoyaleStat title="War wins" image={images.warWon} value={player.details.war_day_wins}/>
                    <ClashRoyaleStat title="Cards found" image={images.cards} value={player.details.cards_found}/>
                </div>
            </div>
        );
    }
}