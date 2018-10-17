import React from 'react'
import { handleErrors } from "../../helpers/api";
import { setTitle } from "../../helpers/browser";
import TournamentsTable from "./TournamentsTable";
import { images } from "../../helpers/assets";
import LastRefreshInfo from "../ui/LastRefreshInfo";

export default class TournamentApp extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            endpoint: '/api/tournaments/playable',
            loading: true,
            data: {},
            refreshInfo: {}
        };
    }

    fetchData() {
        fetch(this.state.endpoint)
            .then(res => handleErrors(res))
            .then(res => this.setState({data: res, loading: false}))
            .catch(error => console.log(error))
    }

    componentDidMount() {
        setTitle("Playable tournaments");
        this.fetchData();
    }

    render() {
        const {data, loading, endpoint} = this.state;
        const tournaments = data.tournaments;

        return (
            <div className="card">
                <div className="card-header">
                    <div className="row">
                        <div className="col-7">
                            <h3>Playable tournaments</h3>
                            <LastRefreshInfo time={data.timestamp}
                                             refreshable={true}
                                             url={endpoint + '/refresh'}
                                             handleData={data => this.setState({data: data})} />
                        </div>
                        <div className="col-5">
                            <img src={images.tournament} style={{float: 'right', height: '3pc'}} />
                        </div>
                    </div>
                </div>
                <div className="card-body">
                    <TournamentsTable data={tournaments} loading={loading} />
                </div>
            </div>
        )
    }
}