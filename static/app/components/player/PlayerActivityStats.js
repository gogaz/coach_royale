import React from 'react';
import moment from 'helpers/moment'
import { withTheme } from 'styled-components'

import { useAutoFetch } from 'hooks/useAxios'
import Loading from 'components/ui/Loading'
import Table from 'components/ui/table/Table'
import { Grid } from 'components/ui/Disposition'
import PlayerWarResultCell from 'components/clan/cells/PlayerWarResultCell'

import PlayerDiffStatsChart from './charts/PlayerDiffStatsChart'
import PlayerRecentBattlesResultsChart from './charts/PlayerRecentBattlesResultsChart'

const PlayerActivityStats = ({ endpoint, theme }) => {
    const columns = React.useMemo(() => [
        {
            Header: "War",
            id: "war",
            accessor: e => moment(e.clan_war.date_start),
            Cell: ({ row }) => `${moment(row.original.clan_war.date_end).short()} to ${row.values.war.short()}`,
        },
        {
            Header: "Participation",
            id: "result",
            accessor: (data) => data.fame + data.repair_points,
            Cell: ({ row }) => <PlayerWarResultCell war={row.original}/>,
        }
    ], [])
    const { loading, response: data } = useAutoFetch(endpoint + '/activity', {})

    if (loading)
        return <Loading/>;

    if (!data)
        return null;

    const { stats, wars } = data;
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
                endpoint={endpoint}
                title="Player battles"
            />
        </Grid>
    );
};

export default withTheme(PlayerActivityStats);
