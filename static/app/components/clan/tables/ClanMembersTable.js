import React, { useMemo } from 'react';
import { Link } from "react-router-dom";
import PropTypes from 'prop-types'
import Table from "../../ui/table/Table";
import styled, { withTheme } from "styled-components";

import { images } from "../../../helpers/assets"

import DonationCell from "../cells/DonationCell";
import Loading from "../../ui/Loading";
import TrophiesCell from "../cells/TrophiesCell";
import { useFetch } from "../../../helpers/browser";
import { SelectColumnFilter } from "../../ui/table/filters";

const ROLES = { elder: 'Elder', coLeader: "Co-Leader", leader: "Leader", member: "Member" };

const PlayerLevelCell = styled.span`
    display: block;
    background: url("${ ({ image }) => image }") no-repeat center;
    text-shadow: 0 1px 1px rgba(0, 0, 0, .5),
                   1px -1px rgba(0, 0, 0, .5),
                   -1px 1px rgba(0, 0, 0, .5),
                   -1px -1px rgba(0, 0, 0, .5);
    color: #fff;
    text-align: center;
    vertical-align: middle;
    font-weight: 800;
    font-size: .75rem;
    width: 100%;
    background-size: 28px;
    height: 32px;
    padding-top: .4rem;
`;

const getBaseColumns = (theme) => [
    {
        Header: "Rank",
        id: "rank",
        accessor: "details.current_clan_rank",
        width: 60,
        filterable: false,
    },
    {
        Header: "Player",
        id: 'name',
        accessor: "name",
        width: null,
        Cell: ({ row }) => <Link to={ "/player/" + row.original.tag }>{ row.values.name }</Link>
    },
    {
        Header: "Trophies",
        id: "trophies",
        accessor: (data) => data.details.trophies.toLocaleString(),
        width: 90,
        Cell: ({ row }) => {
            let props = { trophies: row.original.details.trophies };
            if (row.original.details.arena)
                props = { ...props, arena: row.original.details.arena };

            return <TrophiesCell { ...props } />
        }
    },
    {
        Header: "Level",
        accessor: "details.level",
        id: 'level',
        width: 45,
        Cell: ({ row }) => (
            <PlayerLevelCell image={ images.static('level') }>{ row.values.level }</PlayerLevelCell>
        )
    },
    {
        Header: "Role",
        id: "role",
        Filter: SelectColumnFilter,
        accessor: (data) => ROLES[data.details.clan_role],
        width: 100,
    },
    {
        Header: "Received",
        id: "received",
        accessor: "details.donations_received",
        width: 80,
        Cell: ({ row }) => (
            <DonationCell color={ theme.colors.orange } column='received' row={ row.values } icon='arrow-down'/>
        )
    },
    {
        Header: "Donated",
        id: "given",
        accessor: "details.donations",
        width: 80,
        Cell: ({ row }) => (
            <DonationCell color={ theme.colors.green } column='given' row={ row.values } icon='arrow-up'/>
        )
    },
    {
        Header: "Total",
        id: 'total',
        width: 80,
        accessor: d => d.details.donations - d.details.donations_received,
        Cell: ({ row }) => <DonationCell column='received' compareTo='given' row={ row.values }/>
    },
    // Per-season stats cells
    {
        id: 'ending',
        Header: "Trophies",
        accessor: "details.ending",
        width: 90,
        Cell: ({ row }) => (
            <TrophiesCell trophies={ row.values.ending } arena={ row.original.details.arena }/>
        )
    },
    {
        id: 'highest',
        Header: "Highest",
        accessor: "details.highest",
        width: 90,
        Cell: ({ row }) => <TrophiesCell trophies={ row.values.highest }/>
    },
];

const getColumns = (theme, columnNames) => {
    let columns = [];
    const baseColumns = getBaseColumns(theme);
    for (const name of columnNames) {
        columns = [...columns, baseColumns.find(col => col.id === name)]
    }
    // remove undefined when column is not found
    return columns.filter(x => !!x);
}

const ClanMembersTable = ({
    theme,
    endpoint,
    columns,
    pageSize,
    defaultSorted,
    showPagination,
    onFetchData
}) => {
    const { data, loading } = useFetch(endpoint, onFetchData);
    const tableColumns = useMemo(() => getColumns(theme, columns), [theme, columns]);

    if (loading)
        return <Loading/>;

    if (!data.length)
        return null;

    if (!showPagination) {
        pageSize = data.length;
    }

    return (
        <Table
            {...{data, showPagination}}
            initialPageSize={ pageSize }
            columns={ tableColumns }
            sortBy={ defaultSorted }
            disableFilters
        />
    )
};

ClanMembersTable.propTypes = {
    showPagination: PropTypes.bool.isRequired,
    pageSize: PropTypes.number.isRequired,
    defaultSorted: PropTypes.arrayOf(PropTypes.object).isRequired,
    onFetchData: PropTypes.func,
    columns: PropTypes.arrayOf(PropTypes.string),
};

ClanMembersTable.defaultProps = {
    columns: [
        'rank',
        'name',
        'trophies',
        'level',
        'role',
        'received',
        'given',
        'total',
    ],
    showPagination: false,
    pageSize: 10,
    defaultSorted: [{ id: "rank" }],
};

export default withTheme(ClanMembersTable);