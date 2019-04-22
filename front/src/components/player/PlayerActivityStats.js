import React from 'react';
import PlayerDiffStatsChart from "./charts/PlayerDiffStatsChart";
import PlayerRecentBattlesResultsChart from "./charts/PlayerRecentBattlesResultsChart";
import PlayerWarResultsChart from "./charts/PlayerWarResultsChart";
import ReactTable from "react-table";
import Loading from "../ui/Loading";
import moment from "moment";
import PlayerWarResultCell from "../clan/cells/PlayerWarResultCell";

export default class PlayerActivityStats extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            data: {
                stats: [],
                clan: [],
                wars: {},
                war_results: [],
            },
        }
    }
    componentDidMount() {
        this.fetchData();
    }
    fetchData() {
        const url = this.props.endpoint + '/activity';
        fetch(url)
            .then((res) => res.json())
            .then(result => {
                this.setState({
                    data: {
                        stats: result.stats.reverse(),
                        clan: result.clan.reverse(),
                        wars: result.war_stats,
                        war_results: result.wars,
                    },
                    loading: false
                });
            })
            .catch((error) => {
                console.log(error)
            });
    }
    render() {
        const {loading, data: {stats, wars, war_results}} = this.state;
        if (loading)
            return <Loading/>;

        const statsChart = <PlayerDiffStatsChart
            data={stats} title="Trophies"
            datasets={[
                {
                    label: "Trophies",
                    id: "current_trophies",
                    backgroundColor: "#ffb84d",
                },
            ]}/>;
        const battlesChart = <PlayerRecentBattlesResultsChart
            data={stats} title="Player's battles"
            datasets={[
                {
                    label: "Draws + 2v2",
                    id: "draws",
                    backgroundColor: "#3e95cd",
                },
                {
                    label: "Losses",
                    id: "losses",
                    backgroundColor: "#fd7e14",
                },
                {
                    label: "Wins",
                    id: "wins",
                    backgroundColor: "#28a745",
                },
            ]} />;
        const warsChart = <PlayerWarResultsChart data={wars} title="Player's wars"/>;

        return (
            <div className="row">
                <div className="col-12 col-xl-6 mt-2">
                    {warsChart}
                </div>
                <div className="col-12 col-xl-6 mt-2">
                    {statsChart}
                </div>
                <div className="col-12 col-xl-6 mt-2">
                        <ReactTable
                            data={war_results}
                            resizable={false}
                            pageSize={10}
                            style={{height: '350px'}}
                            defaultSorted={[{idk: 'fieldname', desc: false}]}
                            className='-striped -highlight'
                            bordered={false}
                            columns={[
                                {
                                    Header: "War",
                                    id: "war",
                                    accessor: e => moment(e.date).calendar(),
                                },
                                {
                                    Header: "Result",
                                    id: "result",
                                    Cell: ({row, original}) => <PlayerWarResultCell war={original}/>,
                                }
                            ]}
                        />
                </div>
                <div className="col-12 col-xl-6 mt-2">
                    {battlesChart}
                </div>
            </div>
        );
    }
}