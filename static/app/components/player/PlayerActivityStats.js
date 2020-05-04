import React, { useEffect, useState } from 'react';
import moment from "moment";
import axios from "axios";
import { withTheme } from "styled-components";

import PlayerDiffStatsChart from "./charts/PlayerDiffStatsChart";
import PlayerRecentBattlesResultsChart from "./charts/PlayerRecentBattlesResultsChart";
import PlayerWarResultsChart from "./charts/PlayerWarResultsChart";
import Loading from "../ui/Loading";
import PlayerWarResultCell from "../clan/cells/PlayerWarResultCell";
import { handleErrors } from "../../helpers/api";
import Table from "../ui/table/Table";

const PlayerActivityStats = ({ endpoint, theme }) => {
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
    const columns = React.useMemo(() => [
        {
            Header: "War",
            id: "war",
            accessor: e => moment(e.clan_war.date_start).format('DD/MM'),
        },
        {
            Header: "Result",
            id: "result",
            Cell: ({ row }) => <PlayerWarResultCell war={ row.original }/>,
        }
    ], [])

    if (loading)
        return <Loading/>;

    return (
        <div className="row">
            <div className="col-12 col-xl-6 mt-2">
                <PlayerWarResultsChart data={ warStats } title="Player wars"/>
            </div>
            <div className="col-12 col-xl-6 mt-2">
                <PlayerDiffStatsChart
                    data={ stats }
                    title="Trophies"
                    datasets={ [
                        {
                            label: "Trophies",
                            id: "current_trophies",
                            backgroundColor: theme.colors.yellow,
                        },
                    ] }
                />
            </div>
            <div className="col-12 col-xl-6 mt-2">
                <Table
                    data={ wars }
                    columns={ columns }
                    initialPageSize={ 5 }
                    showPagination
                />
            </div>
            <div className="col-12 col-xl-6 mt-2" style={ {height: '350px'} }>
                <PlayerRecentBattlesResultsChart
                    data={ stats }
                    title="Player battles"
                    datasets={ [
                        {
                            label: "Draws + 2v2",
                            id: "draws",
                            backgroundColor: theme.colors.blue,
                        },
                        {
                            label: "Losses",
                            id: "losses",
                            backgroundColor: theme.colors.orange,
                        },
                        {
                            label: "Wins",
                            id: "wins",
                            backgroundColor: theme.colors.green,
                        },
                    ] }
                />
            </div>
        </div>
    );
};

export default withTheme(PlayerActivityStats);