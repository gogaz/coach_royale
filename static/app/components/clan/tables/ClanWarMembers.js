import React from 'react';
import moment from 'moment'
import styled from "styled-components";
import { Link } from "react-router-dom";

import Loading from "../../ui/Loading";
import PlayerWarResultCell from "../cells/PlayerWarResultCell";
import { locale, useFetch } from "../../../helpers/browser";
import { images } from "../../../helpers/assets";
import DateRangeForm from "../../forms/DateRangeForm";
import TrophiesCell from "../cells/TrophiesCell";
import Table from "../../ui/table/Table";
import { SelectColumnFilter } from "../../ui/table/filters";

const Indicator = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    background-color: ${ ({ color }) => (!!color ?
        `rgba(${ color.r }, ${ color.g }, ${ color.b }, 1)`
        : 'transparent'
    )};
    text-align: right;
    padding: 10px 0 10px 0;
    font-size: .9rem;
`;

const EmptyIndicator = styled(Indicator)`
    background-color: rgb(242, 246, 249);
    box-shadow: inset 0 0 10px ${ ({ theme }) => theme.colors.lightGray };
`;

const winRateFilterMethod = (rows, id, filterValue) => {
    if (filterValue === "all")
        return rows;
    else if (filterValue === "grey")
        return rows.filter(row => row.values[id] < 0);
    else if (filterValue === "red")
        return rows.filter(row => row.values[id] < 50 && row.values[id] >= 0);
    return rows.filter(row => row.values[id] >= 50);
};
winRateFilterMethod.autoRemove = val => !val

const WinRateColumnFilter = ({ column: { filterValue, setFilter }, }) => {
    return (
        <select
            onChange={ e => setFilter(e.target.value) }
            value={ filterValue }
        >
            <option value="">All</option>
            <option value="green" style={ { backgroundColor: '#7de682' } }>&gt;= 50%</option>
            <option value="red" style={ { backgroundColor: '#e66469' } }>&lt; 50%</option>
            <option value="grey" style={ { backgroundColor: '#ccc' } }>None</option>
        </select>
    )
}

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
        accessor: 'details.clan_role',
        width: 85,
        Filter: SelectColumnFilter
    },
    {
        Header: 'Win %',
        id: 'winrate',
        width: 70,
        accessor: (data) => {
            const wins = data.wars.reduce((acc, elem) => acc + elem.final_battles_wins, 0);
            const battles = data.wars.reduce((acc, elem) => acc + (elem.final_battles_done || 1), 0);
            return battles > 0 ? (wins / battles) * 100 : -1;
        },
        Cell: ({ row }) => {
            if (row.values.winrate < 0) {
                return <EmptyIndicator />;
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
        Header: <img alt="Battles missed" src={ images.static('warYet') } height={ 20 } />,
        id: 'count_missing',
        width: 40,
        filterable: false,
        accessor: (data) => data.wars.reduce((acc, elem) => acc + elem.final_battles_misses, 0),
    }
];

const ClanWarMembers = ({ endpoint }) => {
    const { data, loading } = useFetch(endpoint + '/wars', () => {}, {});
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
        return <Loading />;


    if (!wars || !wars.length)
        return null;

    const end_date = wars.reduce((acc, e) => e.date_start, 0);

    return (
        <React.Fragment>
            <DateRangeForm endpoint={ endpoint }
                           handleData={ (data) => setData(data) }
                           start={ moment(end_date) }
            />

            <Table
                data={ members }
                columns={ columns }
                sortBy={ [{ id: 'trophies', desc: true }] }
                filterTypes={ { winRate: winRateFilterMethod } }
                showPagination={false}
            />
        </React.Fragment>
    );
};

export default ClanWarMembers;