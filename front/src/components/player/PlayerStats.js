import React from 'react';
import { images } from "../../helpers/assets";
import ClashRoyaleStat from "../ui/ClashRoyaleStat";
import Loading from "../ui/Loading";
import { handleErrors, playerLeagueFromTrophies } from "../../helpers/api";
import PlayersClan from "./PlayersClan";

export default class PlayerStats extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            player: {details:{}}
        }
    }
    componentDidMount() {
        console.log(this.props.endpoint);
        fetch(this.props.endpoint)
            .then((res) => handleErrors(res))
            .then(
                (result) => {
                    console.log(result);
                    this.setState({ loading: false, player: result });
                })
            .catch(error => console.log(error) );
    }
    render() {
        const { loading, player} = this.state;

        if (loading) return <Loading/>;

        return (
            <div className="card-header">
                <div className="row">
                    <div className="col-7">
                        <h3>{player.name}</h3>
                        <PlayersClan clan={player.clan} endpoint={this.props.endpoint}/>
                    </div>
                    <div className="col-5">
                        <img src={player.clan.details.badge} style={{ float: 'right', height: '5pc' }} />
                    </div>
                </div>
                <div className="row mt-2">
                    <ClashRoyaleStat title="Trophies" localeString={null}
                                     image={player.details.current_trophies > 4000 ? images.arenaX(player.details.arena) : images.trophy}
                                     value={player.details.current_trophies} />
                    <ClashRoyaleStat title="Highest" localeString={null}
                                     image={player.details.highest_trophies > 4000 ?
                                         images.leagueX(playerLeagueFromTrophies(player.details.highest_trophies)) : images.trophyRibbon}
                                     value={player.details.highest_trophies} />
                    <ClashRoyaleStat title="War wins" image={images.war} value={player.details.war_day_wins}/>
                    <ClashRoyaleStat title="Cards found" image={images.cards} value={player.details.cards_found}/>
                </div>
            </div>
        );
    }
}