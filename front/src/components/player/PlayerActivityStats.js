import React from 'react';
import PlayerDiffStatsChart from "./charts/PlayerDiffStatsChart";
import PlayerRecentBattlesResultsChart from "./charts/PlayerRecentBattlesResultsChart";

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
                    },
                    loading: false
                });
            })
            .catch((error) => {
                console.log(error)
            });
    }
    render() {
        const {data : {clan, stats}} = this.state;
        let statsChart = "";
        let clanChart = "";
        let battlesChart = "";
        if (stats && stats.length > 0)
        {
            statsChart = <PlayerDiffStatsChart
                data={stats} height={120} title="Player's stats"
                datasets={[
                    {
                        label: "Trophies",
                        id: "current_trophies",
                        borderColor: "#F7CA18",
                        fill: false,
                    },
                    {
                        label: "Games",
                        id: "total_games",
                        borderColor: "#c45850",
                        fill: false,
                    },
                    {
                        label: "Total donations",
                        id: "total_donations",
                        borderColor: "#e8c3b9",
                        fill: false,
                    },
                ]}/>;
            battlesChart = <PlayerRecentBattlesResultsChart
                data={stats} height={120} title="Player's battles"
                datasets={[
                    {
                        label: "Draws + 2v2",
                        id: "draws",
                        backgroundColor: "#007bff",
                        fill: false,
                    },
                    {
                        label: "Losses",
                        id: "losses",
                        backgroundColor: "#fd7e14",
                        fill: false,
                    },
                    {
                        label: "Wins",
                        id: "wins",
                        backgroundColor: "#28a745",
                        fill: false,
                    },
                ]} />
        }

        if (stats && stats.length > 0)
            clanChart = <PlayerDiffStatsChart
                data={clan} height={120} title="Player's stats in clan"
                datasets={[
                    {
                        label: "Clan rank",
                        id: "current_clan_rank",
                        borderColor: "#3e95cd",
                        fill: false,
                    },
                ]} />;

        return (
            <div className="row">
                <div className="col-12 col-xl-6 mt-2">
                    {statsChart}
                </div>
                <div className="col-12 col-xl-6 mt-2">
                    {clanChart}
                </div>
                <div className="col-12 col-xl-6 mt-2">
                    {battlesChart}
                </div>
            </div>
        );
    }
}