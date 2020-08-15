import React from 'react';
import moment from 'moment'
import { withTheme } from 'styled-components'

import { useFetch } from 'helpers/browser'
import Loading from 'components/ui/Loading'
import Table from 'components/ui/table/Table'
import { Grid } from 'components/ui/Disposition'
import PlayerWarResultCell from 'components/clan/cells/PlayerWarResultCell'

import PlayerDiffStatsChart from './charts/PlayerDiffStatsChart'
import PlayerRecentBattlesResultsChart from './charts/PlayerRecentBattlesResultsChart'
import PlayerWarResultsChart from './charts/PlayerWarResultsChart'

const PlayerActivityStats = ({ endpoint, theme }) => {
    const columns = React.useMemo(() => [
        {
            Header: "War",
            id: "war",
            accessor: e => moment(e.clan_war.date_start),
            Cell: ({ row }) => {
                const currentDate = moment();
                if (currentDate.format('YYYY') !== row.values.war.format('YYYY'))
                    return row.values.war.format('L');
                return row.values.war.format('DD/MM');
            }
        },
        {
            Header: "Result",
            id: "result",
            Cell: ({ row }) => <PlayerWarResultCell war={row.original}/>,
        }
    ], [])
    const { loading, data } = useFetch(endpoint + '/activity', {})

    if (loading)
        return <Loading/>;

    if (!data)
        return null;

    const { stats, wars, war_stats: warStats } = data;
    const WarsTable = () => (
        <Table
            data={wars}
            columns={columns}
            initialPageSize={5}
            showPagination
        />
    )

    return (
        <Grid columns={{ sm: 1, md: 2 }} style={{ padding: '1.25rem' }} gap="20px">
            <PlayerWarResultsChart data={warStats} title="Player wars"/>
            <PlayerDiffStatsChart
                data={stats.reverse()}
                title="Trophies"
                datasets={[
                    {
                        label: "Trophies",
                        id: "current_trophies",
                        backgroundColor: theme.colors.yellow,
                    },
                ]}
            />

            <WarsTable/>

            <PlayerRecentBattlesResultsChart
                data={stats}
                title="Player battles"
                datasets={[
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
                ]}
            />
        </Grid>
    );
};

export default withTheme(PlayerActivityStats);