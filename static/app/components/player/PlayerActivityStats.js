import React from 'react';
import moment from "moment";
import { withTheme } from "styled-components";

import PlayerDiffStatsChart from "./charts/PlayerDiffStatsChart";
import PlayerRecentBattlesResultsChart from "./charts/PlayerRecentBattlesResultsChart";
import PlayerWarResultsChart from "./charts/PlayerWarResultsChart";
import Loading from "../ui/Loading";
import PlayerWarResultCell from "../clan/cells/PlayerWarResultCell";
import Table from "../ui/table/Table";
import { useFetch } from "../../helpers/browser";
import { Grid } from "../ui/Disposition";

const PlayerActivityStats = ({ endpoint, theme }) => {
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
    const { loading, data } = useFetch(endpoint + '/activity', {})

    if (loading)
        return <Loading/>;

    if (!data)
        return null;

    const { stats, wars, war_stats: warStats } = data;

    return (
        <Grid columns={ { sm: 1, md: 2 } } style={ { padding: '1.25rem' } } gap="20px">
            <PlayerWarResultsChart data={ warStats } title="Player wars"/>
            <PlayerDiffStatsChart
                data={ stats.reverse() }
                title="Trophies"
                datasets={ [
                    {
                        label: "Trophies",
                        id: "current_trophies",
                        backgroundColor: theme.colors.yellow,
                    },
                ] }
            />
            <Table
                data={ wars }
                columns={ columns }
                initialPageSize={ 5 }
                showPagination
            />
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
        </Grid>
    );
};

export default withTheme(PlayerActivityStats);