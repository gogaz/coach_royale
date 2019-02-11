import React from 'react';
import { Link } from "react-router-dom";
import Loading from "../ui/Loading";
import { handleErrors } from "../../helpers/api";
import DonationCell from "../clan/cells/DonationCell";
import moment from 'moment'

export default class PlayersClan extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            endpoint: props.endpoint + '/clan',
            player: {},
        }
    }

    componentDidMount() {
        fetch(this.state.endpoint)
            .then((res) => handleErrors(res))
            .then(
                (result) => {
                    console.log(result);
                    this.setState({ loading: false, player: result });
                })
            .catch(error => console.log(error) );
    }

    render() {
        const { clan } = this.props;
        const { player, loading } = this.state;
        const roles = {elder: 'Elder', coLeader: "Co-Leader", leader: "Leader", member: "Member"};

        return (
            <div className="mt-3">
                <span className="mr-2"><Link to={"/clan/"+clan.tag}>{clan.name}</Link></span>
                <Loading height="2.5pc" loading={loading} />
                <div className="player-clan-info" hidden={loading} style={{display: 'inline-block'}}>
                    <span className="text-muted">{roles[player.clan_role]}</span>
                    <span className="text-muted">#{player.current_clan_rank}</span>
                    <span className="text-muted">
                        <DonationCell row={player} icon="arrow-up" color="success" column="donations"/>
                    </span>
                    <span className="text-muted">
                        <DonationCell row={player} icon="arrow-down" color="danger" column="donations_received"/>
                    </span>
                    {player.joined &&
                        <span className="text-muted">Joined {moment(player.joined).calendar()}</span>
                    }
                </div>
            </div>
        );
    }
}