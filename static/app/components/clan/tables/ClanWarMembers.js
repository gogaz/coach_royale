import React from 'react';
import moment from 'utils/moment'
import styled from 'styled-components'
import {Link} from 'react-router-dom'

import {images} from 'utils/assets'
import {CLAN_ROLES} from 'utils/constants'
import {locale} from 'utils/browser'
import {useAutoFetch} from 'hooks/useAxios'

import Loading from 'components/ui/Loading'
import Table from 'components/ui/table/Table'
import { SelectColumnFilter } from 'components/ui/table/filters'
import PlayerWarResultCell from 'components/clan/cells/PlayerWarResultCell'
import TrophiesCell from 'components/clan/cells/TrophiesCell'

const Indicator = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    background-color: ${({color}) => (!!color ?
        `rgba(${color.r}, ${color.g}, ${color.b}, 1)`
        : 'transparent'
)};
    text-align: right;
    padding: 10px 5px;
    font-size: .9rem;
`;

const EmptyIndicator = styled(Indicator)`
    background-color: rgb(242, 246, 249);
    box-shadow: inset 0 0 10px ${({theme}) => theme.colors.lightGray};
`;

const WarHeaderCell = styled.div`
    display: flex;
    flex-direction: column;
`

const WarHeader = styled.div`
    width: 100%;
    display: flex;
    justify-content: space-around;
`

const getIndicatorColor = (percentage) => {
    if (percentage < 50) {
        return {
            r: 230 + percentage / 5,
            g: 100 + 2.5 * percentage,
            b: 105 + 2.5 * percentage
        };
    }
    if (percentage > 50) {
        return {
            r: 250 - 2.5 * (percentage - 50),
            g: 230 + (100 - percentage) / 3,
            b: 255 - 2.5 * (percentage - 50)
        };
    }
    return {r: 255, g: 255, b: 255};
}

const BASE_COLUMNS = [
    {
        Header: <img alt="Trophies" src={images.static('trophy')} height={20}/>,
        id: 'trophies',
        accessor: (data) => data.details.trophies.toLocaleString(),
        width: 80,
        Cell: ({row}) => (
            <TrophiesCell trophies={row.original.details.trophies} arena={row.original.details.arena}/>
        ),
        filterable: false,
    },
    {
        Header: 'Name',
        id: 'name',
        accessor: 'name',
        Cell: ({row}) => {
            return <Link to={"/player/" + row.original.tag}>{row.values.name}</Link>
        }
    },
    {
        Header: 'Role',
        id: 'role',
        accessor: (data) => data.details.clan_role,
        Cell: ({row}) => {
            return CLAN_ROLES[row.values.role]
        },
        width: 85,
        Filter: SelectColumnFilter
    },
    {
        Header: <img alt="Fame" src={images.static('cw-fame')} height={20}/>,
        id: 'fame',
        width: 40,
        accessor: (data) => {
            return data.wars.reduce((acc, elem) => acc + elem.fame, 0);
        },
        Cell: ({row, rows}) => {
            const maxFame = rows.reduce((acc, e) => e.values.fame > acc ? e.values.fame : acc, 0)
            const fameRate = maxFame > 0 ? row.values.fame / maxFame * 100 : 0
            return (
                <Indicator color={getIndicatorColor(fameRate)}>
                    {Number(row.values.fame).toLocaleString(locale)}
                </Indicator>
            )
        },
        filterable: false,
    },
    {
        Header: <img alt="Repair points" src={images.static('cw-repair')} height={20}/>,
        id: 'repair_points',
        width: 40,
        filterable: false,
        accessor: (data) => data.wars.reduce((acc, elem) => acc + elem.repair_points, 0),
        Cell: ({row, rows}) => {
            const maxRepairPts = rows.reduce((acc, e) => e.values.repair_points > acc ? e.values.repair_points : acc, 0)
            const repairRate = maxRepairPts > 0 ? row.values.repair_points / maxRepairPts * 100 : 0
            return (
                <Indicator color={getIndicatorColor(repairRate)}>
                    {row.values.repair_points.toLocaleString(locale)}
                </Indicator>
            )
        },
    },
];

const ClanWarMembers = ({endpoint}) => {
    const {response: data, loading} = useAutoFetch(endpoint + '/wars', {});
    const {wars, members} = data;
    const columns = React.useMemo(() => {
        if (!wars)
            return [];
        return [...BASE_COLUMNS, ...wars.map(e => {
            const finishTime = moment(e.finish_time).short();
            let th = 'th';
            if (e.final_position === 1) th = 'st';
            if (e.final_position === 2) th = 'nd';
            if (e.final_position === 3) th = 'rd';
            return {
                Header: () => (
                    <WarHeaderCell>
                        <WarHeader>
                            <b>{finishTime}</b>
                        </WarHeader>
                        <WarHeader>
                            <small className="text-muted">
                                {e.final_position}
                                <span style={{verticalAlign: 'super'}}>{th}</span>
                            </small>
                        </WarHeader>
                    </WarHeaderCell>
                ),
                id: 'war' + e.id,
                width: 65,
                accessor: (data) => {
                    const war = data.wars.find(value => value.clan_war_id === e.id);
                    return war ? war.fame : null;
                },
                Cell: ({row}) => {
                    const war = row.original.wars.find(value => value.clan_war_id === e.id);
                    if (!war) return <EmptyIndicator />
                    return (
                        <PlayerWarResultCell war={war} />
                    )
                },
                filterable: false,
            };
        })]
    }, [wars]);

    if (loading)
        return <Loading/>;

    if (!wars || !wars.length)
        return null;

    return (
        <Table
            data={members}
            columns={columns}
            sortBy={[{id: 'trophies', desc: true}]}
            showPagination={false}
            rowStyle={{ height: '50px' }}
        />
    );
};

export default ClanWarMembers;
