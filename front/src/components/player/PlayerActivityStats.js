import React from 'react';
import PlayerDiffStatsChart from "./charts/PlayerDiffStatsChart";
import PlayerRecentBattlesResultsChart from "./charts/PlayerRecentBattlesResultsChart";
import PlayerWarResultsChart from "./charts/PlayerWarResultsChart";

export default class PlayerActivityStats extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            data: {},
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
                console.log(result);
                this.setState({
                    data: {
                        stats: result.stats.reverse(),
                        clan: result.clan.reverse(),
                        wars: result.wars,
                    },
                    loading: false
                });
            })
            .catch((error) => {
                console.log(error)
            });
    }
    render() {
        const {data : {stats, wars}} = this.state;
        let statsChart = "";
        let battlesChart = "";
        let warsChart = "";
        if (stats && stats.length > 0)
        {
            statsChart = <PlayerDiffStatsChart
                data={stats} title="Trophies"
                datasets={[
                    {
                        label: "Trophies",
                        id: "current_trophies",
                        backgroundColor: "#ffb84d",
                    },
                ]}/>;
            battlesChart = <PlayerRecentBattlesResultsChart
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
                ]} />
        }

        if (wars)
            warsChart = <PlayerWarResultsChart data={wars} title="Player's wars"/>;

        return (
            <div className="row">
                <div className="col-12 col-xl-6 mt-2">
                    {warsChart}
                </div>
                <div className="col-12 col-xl-6 mt-2">
                    {battlesChart}
                </div>
                <div className="col-12 col-xl-6 mt-2">
                    {statsChart}
                </div>
            </div>
        );
    }
}