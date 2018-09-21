import React from 'react'
import { handleErrors } from "../../helpers/api";
import TournamentsTable from "./TournamentsTable";

export default class TournamentApp extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            endpoint: '/tournaments/playable',
            loading: true,
            tournaments: [],
        }
    }
    componentDidMount() {
        fetch(this.props.endpoint)
            .then(res => handleErrors(res))
            .then(res => this.setState({tournaments: res, loading: false}))
            .catch(error => console.log(error))
    }
    render() {
        const { tournaments, loading } = this.state;

        return (
            <div className="card">
                <div className="card-body">
                    <TournamentsTable data={tournaments} loading={loading}/>
                </div>
            </div>
        )
    }
}