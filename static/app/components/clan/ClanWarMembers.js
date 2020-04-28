import React, { useEffect, useState } from 'react';
import ReactTable from "react-table";
import moment from 'moment'
import styled from "styled-components";
import axios from "axios";
import { Link } from "react-router-dom";

import Loading from "../ui/Loading";
import PlayerWarResultCell from "./cells/PlayerWarResultCell";
import { locale, useFetch } from "../../helpers/browser";
import { images } from "../../helpers/assets";
import DateRangeForm from "../forms/DateRangeForm";
import { handleErrors } from "../../helpers/api";
import TrophiesCell from "./cells/TrophiesCell";

const Indicator = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    background-color: ${ ({ color }) => !color ? 'transparent' : `rgba(${ color.r }, ${ color.g }, ${ color.b }, 1)` }
`;

const EmptyIndicator = styled(Indicator)`
    background-color: rgb(242, 246, 249);
    box-shadow: inset 0 0 10px ${ ({ theme }) => theme.colors.lightGray };
`;

const IndicatorContent = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    padding: inherit;
    text-align: right;
`;

const BASE_COLUMNS = [
    {
        Header: <img src={ images.static('trophy') } height={ 20 }/>,
        id: 'trophies',
        accessor: "details.trophies",
        width: 80,
        Cell: ({ row, original }) => <TrophiesCell trophies={ row.trophies } arena={ original.details.arena }/>,
        filterable: false,
    },
    {
        Header: "Name",
        accessor: "name",
        Cell: ({ row, original }) => {
            return <Link to={ "/player/" + original.tag }>{ row.name }</Link>
        }
    },
    {
        Header: "Role",
        id: "role",
        accessor: "details.clan_role",
        width: 85,
        filterMethod: (filter, row) => {
            if (filter.value === "all") {
                return true;
            }
            return row.role === filter.value;
        },
        Filter: ({ filter, onChange }) => (
            <select
                onChange={ event => onChange(event.target.value) }
                style={ { width: "100%" } }
                value={ filter ? filter.value : "all" }>
                <option value="all">All</option>
                <option value="member">Members</option>
                <option value="elder">Elders</option>
                <option value="coLeader">Co-Leaders</option>
            </select>
        )
    },
    {
        Header: "Win %",
        id: "winrate",
        style: { position: 'relative' },
        width: 70,
        accessor: (data) => {
            const wins = data.wars.reduce((acc, elem) => acc + elem.final_battles_wins, 0);
            const battles = data.wars.reduce((acc, elem) => acc + (elem.final_battles_done || 1), 0);
            return battles > 0 ? (wins / battles) * 100 : -1;
        },
        Cell: ({ row }) => {
            if (row.winrate < 0) {
                return <EmptyIndicator/>
            }
            let color = { r: 255, g: 255, b: 255 };
            if (row.winrate < 50 && row.winrate !== null)
                color = { r: 230 + row.winrate / 5, g: 100 + 2.5 * row.winrate, b: 105 + 2.5 * row.winrate };
            if (row.winrate > 50)
                color = { g: 230 + (100 - row.winrate) / 3, r: 250 - 2.5 * (row.winrate - 50), b: 255 - 2.5 * (row.winrate - 50) };
            return (
                <div style={ { padding: 'inherit' } }>
                    <Indicator color={ color }/>
                    <IndicatorContent>
                        { row.winrate !== null && Number(row.winrate).toLocaleString(locale, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        }) + '%' }
                    </IndicatorContent>
                </div>
            )
        },
        filterMethod: (filter, row) => {
            if (filter.value === "all")
                return true;
            else if (filter.value === "grey")
                return row.winrate < 0;
            else if (filter.value === "red")
                return row.winrate < 50 && row.winrate >= 0;
            return row.winrate >= 50;
        },
        Filter: ({ filter, onChange }) => (
            <select
                onChange={ event => onChange(event.target.value) }
                style={ { width: "100%" } }
                value={ filter ? filter.value : "all" }>
                <option value="all">All</option>
                <option value="green" style={ { backgroundColor: '#7de682' } }>&gt;= 50%</option>
                <option value="red" style={ { backgroundColor: '#e66469' } }>&lt; 50%</option>
                <option value="grey" style={ { backgroundColor: '#ccc' } }>None</option>
            </select>
        )
    },
    {
        Header: <img src={ images.static('battle') } height={ 20 }/>,
        id: "count",
        width: 40,
        filterable: false,
        accessor: (data) => data.wars.reduce((acc, elem) => acc + elem.final_battles_done, 0),
    },
    {
        Header: <img src={ images.static('warYet') } height={ 20 }/>,
        id: "count_missing",
        width: 40,
        filterable: false,
        accessor: (data) => data.wars.reduce((acc, elem) => acc + (elem.final_battles_done === 0 ? 1 : 0), 0),
    }
];

const ClanWarMembers = ({ endpoint }) => {
    const { data, loading } = useFetch(endpoint + '/wars');

    if (loading) return <Loading/>;

    const { wars, members } = data;

    let columns = [...BASE_COLUMNS];

    wars.map(e => {
        const date = moment(e.date_start).format('DD/MM');
        const column = {
            Header: date,
            id: 'war' + e.id,
            width: 65,
            Cell: ({ row, original }) => <PlayerWarResultCell war={ original.wars.find(value => value.clan_war_id === e.id) }/>,
            sortable: false,
            filterable: false,
        };
        columns = [...columns, column]
    });

    const end_date = wars.reduce((acc, e) => e.date_start, 0);

    return (
        <React.Fragment>
            <DateRangeForm endpoint={ endpoint }
                           handleData={ (data) => setData(data) }
                           start={ moment(end_date) }
            />
            <Loading loading={ loading }/>
            <ReactTable
                className='-striped -highlight'
                data={ members }
                columns={ columns }
                resizable={ false }
                filterable
                defaultSorted={ [{ id: "trophies", desc: true }] }
                hidden={ loading }
                loading={ loading }
                pageSize={ members.length }
                showPagination={ false }
            />
        </React.Fragment>
    );
};

export default ClanWarMembers;