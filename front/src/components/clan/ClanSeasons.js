import React from 'react'
import ClanMembersTable from "./ClanMembersTable";
import TrophiesCell from "./cells/TrophiesCell";
import { playerLeagueFromTrophies } from "../../helpers/api";
import moment from "moment";

export default class ClanSeasons extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            previousSeason: null,
        }
    }
    render() {
        const {previousSeason} = this.state;
        return (
            <div className="row">
                <div className="col-md-6 mt-2">
                        <div className="card-header"><h4>Previous week</h4></div>
                        <ClanMembersTable
                            endpoint={this.props.endpoint + '/weekly'}
                            columns={['name', 'trophies', 'given']}
                            defaultSorted={[{id: "trophies", desc: true}]}
                        />
                </div>
                <div className="col-md-6 mt-2">
                    <div className="card-header"><h4>Previous Season{previousSeason && ` (${previousSeason.format('MMM YYYY')})`}</h4></div>
                    <ClanMembersTable
                        endpoint={this.props.endpoint + '/season'}
                        columns={[
                            'name',
                            {
                                Header: "Trophies",
                                id:'trophies',
                                accessor: "details.ending",
                                width: 90, Cell: ({row, original}) => <TrophiesCell trophies={row.trophies} league={playerLeagueFromTrophies(original.details.ending)} />
                            },
                        ]}
                        defaultSorted={[{id: "trophies", desc: true}]}
                        onFetchData={(data) => this.setState({previousSeason: moment(data[0].details.season__identifier + '-01', 'YYYY-MM-DD')})}
                    />
                </div>
            </div>
        );
    }
}