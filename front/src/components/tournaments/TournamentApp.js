import React from 'react'
import ReactTooltip from 'react-tooltip'
import { handleErrors, setTitle } from "../../helpers/api";
import TournamentsTable from "./TournamentsTable";
import { images } from "../../helpers/assets";

const moment = require("moment");

export default class TournamentApp extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            endpoint: '/api/tournaments/playable',
            loading: true,
            data: {},
        }
    }
    componentDidMount() {
        setTitle("Playable tournaments");
        fetch(this.state.endpoint)
            .then(res => handleErrors(res))
            .then(res => this.setState({data: res, loading: false}))
            .catch(error => console.log(error))
    }
    render() {
        const { data, loading } = this.state;
        const tournaments = data.tournaments;
        const last_refresh = moment(data.timestamp);

        return (
            <div className="card">
                <div className="card-header">
                    <div className="row">
                        <div className="col-7">
                            <h3>Joinable tournaments</h3>
                            <small>
                                <span className="text-muted text-uppercase" data-tip="last refreshed">
                                    Last successful refresh { last_refresh.fromNow() }
                                </span>
                                <ReactTooltip place="bottom" type="dark" effect="solid">
                                    { last_refresh.format('L') + ' ' + last_refresh.format('LTS') }
                                </ReactTooltip>
                            </small>
                        </div>
                        <div className="col-5">
                            <img src={images.tournament} style={{ float: 'right', height: '3pc' }} />
                        </div>
                    </div>
                </div>
                <div className="card-body">
                    <TournamentsTable data={tournaments} loading={loading}/>
                </div>
            </div>
        )
    }
}