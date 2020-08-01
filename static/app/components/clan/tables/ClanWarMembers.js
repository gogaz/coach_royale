import React  from 'react';
import moment from 'moment'
import styled from 'styled-components'
import { Link } from 'react-router-dom'

import { images } from 'helpers/assets'
import { CLAN_ROLES } from 'helpers/constants'
import { locale, useFetch } from 'helpers/browser'

import Loading from 'components/ui/Loading'
import Table from 'components/ui/table/Table'
import { SelectColumnFilter, WinRateColumnFilter } from 'components/ui/table/filters'
import PlayerWarResultCell from 'components/clan/cells/PlayerWarResultCell'
import TrophiesCell from 'components/clan/cells/TrophiesCell'
import DateRangeForm from 'components/forms/DateRangeForm'

const Indicator = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    background-color: ${ ({ color }) => (!!color ?
        `rgba(${ color.r }, ${ color.g }, ${ color.b }, 1)`
        : 'transparent'
    ) };
    text-align: right;
    padding: 10px 5px 10px 5px;
    font-size: .9rem;
`;

const EmptyIndicator = styled(Indicator)`
    background-color: rgb(242, 246, 249);
    box-shadow: inset 0 0 10px ${ ({ theme }) => theme.colors.lightGray };
`;

const BASE_COLUMNS = [
    {
        Header: <img alt="Trophies" src={ images.static('trophy') } height={ 20 }/>,
        id: 'trophies',
        accessor: (data) => data.details.trophies.toLocaleString(),
        width: 80,
        Cell: ({ row }) => (
            <TrophiesCell trophies={ row.original.details.trophies } arena={ row.original.details.arena }/>
        ),
        filterable: false,
    },
    {
        Header: 'Name',
        id: 'name',
        accessor: 'name',
        Cell: ({ row }) => {
            return <Link to={ "/player/" + row.original.tag }>{ row.values.name }</Link>
        }
    },
    {
        Header: 'Role',
        id: 'role',
        accessor: (data) => data.details.clan_role,
        Cell: ({ row }) => {
            return CLAN_ROLES[row.values.role]
        },
        width: 85,
        Filter: SelectColumnFilter
    },
    {
        Header: 'Win %',
        id: 'winrate',
        width: 90,
        accessor: (data) => {
            const wins = data.wars.reduce((acc, elem) => acc + elem.final_battles_wins, 0);
            const battles = data.wars.reduce((acc, elem) => acc + elem.final_battles_done, 0);
            return battles > 0 ? (wins / battles) * 100 : -1;
        },
        Cell: ({ row }) => {
            if (row.values.winrate < 0) {
                return <EmptyIndicator/>;
            }
            let color = { r: 255, g: 255, b: 255 };
            if (row.values.winrate < 50 && row.values.winrate !== null)
                color = {
                    r: 230 + row.values.winrate / 5,
                    g: 100 + 2.5 * row.values.winrate,
                    b: 105 + 2.5 * row.values.winrate
                };
            if (row.values.winrate > 50)
                color = {
                    r: 250 - 2.5 * (row.values.winrate - 50),
                    g: 230 + (100 - row.values.winrate) / 3,
                    b: 255 - 2.5 * (row.values.winrate - 50)
                };
            return (
                <Indicator color={ color }>
                    { row.values.winrate !== null &&
                    Number(row.values.winrate).toLocaleString(locale, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    })
                    + '%'
                    }
                </Indicator>
            )
        },
        filter: 'winRate',
        Filter: WinRateColumnFilter
    },
    {
        Header: <img alt="Battles" src={ images.static('battle') } height={ 20 }/>,
        id: 'count',
        width: 40,
        filterable: false,
        accessor: (data) => data.wars.reduce((acc, elem) => acc + elem.final_battles_done, 0),
    },
    {
        Header: <img alt="Battles missed" src={ images.static('warYet') } height={ 20 }/>,
        id: 'count_missing',
        width: 40,
        filterable: false,
        accessor: (data) => data.wars.reduce((acc, elem) => acc + elem.final_battles_misses, 0),
    }
];

const ClanWarMembers = ({ endpoint }) => {
    const { data, loading } = useFetch(endpoint + '/wars', {});
    const { wars, members } = data;
    const columns = React.useMemo(() => {
        if (!wars)
            return [];
        return [...BASE_COLUMNS, ...wars.map(e => {
            const date = moment(e.date_start).format('DD/MM');
            return {
                Header: date,
                id: 'war' + e.id,
                width: 65,
                accessor: (data) => {
                    return data.wars.find(value => value.clan_war_id === e.id);
                },
                Cell: ({ row }) => (
                    <PlayerWarResultCell war={ row.values['war' + e.id] }/>
                ),
                disableSortBy: true,
                filterable: false,
            };
        })]
    }, [wars]);

    if (loading)
        return <Loading/>;

    if (!wars || !wars.length)
        return null;

    const endDate = wars.reduce((acc, e) => e.date_start, 0);

    return (
        <React.Fragment>
            <DateRangeForm endpoint={ endpoint }
                           handleData={ (data) => setData(data) }
                           start={ moment(endDate) }
            />

            <Table
                data={ members }
                columns={ columns }
                sortBy={ [{ id: 'trophies', desc: true }] }
                showPagination={ false }
            />
        </React.Fragment>
    );
};

export default ClanWarMembers;