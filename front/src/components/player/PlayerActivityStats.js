import React, { useEffect, useState } from 'react';
import moment from "moment";
import axios from "axios";

import ReactTable from "react-table";

import PlayerDiffStatsChart from "./charts/PlayerDiffStatsChart";
import PlayerRecentBattlesResultsChart from "./charts/PlayerRecentBattlesResultsChart";
import PlayerWarResultsChart from "./charts/PlayerWarResultsChart";
import Loading from "../ui/Loading";
import PlayerWarResultCell from "../clan/cells/PlayerWarResultCell";
import { handleErrors } from "../../helpers/api";

const PlayerActivityStats = ({ endpoint }) => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [clan, setClan] = useState(null);
    const [warStats, setWarStats] = useState(null);
    const [wars, setWars] = useState(null);

    useEffect(() => {
        const url = endpoint + '/activity';
        axios.get(url)
            .then(result => handleErrors(result))
            .then(result => {
                setStats(result.stats.reverse());
                setClan(result.clan.reverse());
                setWarStats(result.war_stats);
                setWars(result.wars);
                setLoading(false);
            })
            .catch((error) => {
                console.log(error)
            });
    }, []);

    if (loading)
        return <Loading/>;

    const statsChart = <PlayerDiffStatsChart
        data={ stats } title="Trophies"
        datasets={ [
            {
                label: "Trophies",
                id: "current_trophies",
                backgroundColor: "#ffb84d",
            },
        ] }/>;
    const battlesChart = <PlayerRecentBattlesResultsChart
        data={ stats } title="Player's battles"
        datasets={ [
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
        ] }/>;
    const warsChart = <PlayerWarResultsChart data={ warStats } title="Player's wars"/>;

    return (
        <div className="row">
            <div className="col-12 col-xl-6 mt-2">
                { warsChart }
            </div>
            <div className="col-12 col-xl-6 mt-2">
                { statsChart }
            </div>
            <div className="col-12 col-xl-6 mt-2">
                <ReactTable
                    data={ wars }
                    resizable={ false }
                    pageSize={ 10 }
                    style={ { height: '350px' } }
                    defaultSorted={ [{ idk: 'fieldname', desc: false }] }
                    className='-striped -highlight'
                    bordered={ false }
                    columns={ [
                        {
                            Header: "War",
                            id: "war",
                            accessor: e => moment(e.date).calendar(),
                        },
                        {
                            Header: "Result",
                            id: "result",
                            Cell: ({ row, original }) => <PlayerWarResultCell war={ original }/>,
                        }
                    ] }
                />
            </div>
            <div className="col-12 col-xl-6 mt-2">
                { battlesChart }
            </div>
        </div>
    );
};

export default PlayerActivityStats;