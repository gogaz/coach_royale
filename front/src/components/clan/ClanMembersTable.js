import React from 'react';
import PropTypes from 'prop-types'
import ReactTable from "react-table";
import { images } from "../../helpers/assets"
import { Link } from "react-router-dom";
import DonationCell from "./cells/DonationCell";
import Loading from "../ui/Loading";
import TrophiesCell from "./cells/TrophiesCell";

const ROLES = {elder: 'Elder', coLeader: "Co-Leader", leader: "Leader", member: "Member"};

const BASE_COLUMNS = [
    {
        Header: "Rank",
        id: "rank",
        accessor: "details.current_clan_rank",
        width: 45
    },
    {
        Header: "Player",
        id: 'name',
        accessor: "name",
        Cell: ({row, original}) => {
            return <Link to={"/player/" + original.tag}>{row.name}</Link>
        }
    },
    {
        Header: "Trophies",
        id: "trophies",
        accessor: "details.trophies",
        width: 90,
        Cell: ({row, original}) => {
            let cellProps = { trophies: row.trophies };
            if (original.details.arena)
                cellProps = {...cellProps, arena: original.details.arena};

            return <TrophiesCell {...cellProps} />
        }
    },
    {
        Header: "Level",
        accessor: "details.level",
        id: 'level',
        width: 45,
        Cell: ({row}) => (
            <span
                className="level-td"
                style={{backgroundImage: 'url(' + images.static('level') + ')'}}
            >
                {row.level}
            </span>
        )
    },
    {
        Header: "Role",
        id: "role",
        accessor: "details.clan_role",
        width: 100,
        Cell: ({row}) => {
            return ROLES[row.role]
        }
    },
    {
        Header: "Received",
        id: "received",
        accessor: "details.donations_received",
        width: 80,
        Cell: ({row}) => <DonationCell color='warning' column='received' row={row} icon='arrow-down' />
    },
    {
        Header: "Donated",
        id: "given",
        accessor: "details.donations",
        width: 80,
        Cell: ({row}) => <DonationCell color='primary' column='given' row={row} icon='arrow-up' />
    },
    {
        Header: "Total",
        id: 'total',
        width: 80,
        accessor: d => d.details.donations - d.details.donations_received,
        Cell: ({row}) => <DonationCell column='received' compareTo='given' row={row} />
    }
];

export default class ClanMembersTable extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            data: [],
            loading: true,
            endpoint: props.endpoint,
            error: null,
        };
    }

    componentDidMount() {
        fetch(this.state.endpoint)
            .then(res => res.json())
            .then(result => this.setState({data: result, loading: false}))
            .catch(error => console.log(error))
            .then(result => this.props.onFetchData(result))
            .catch(error => this.setState({error: error}))
        ;
    }

    render() {
        const {data, loading} = this.state;
        if (!data && !loading)
            return <Loading/>;
        if (!data.length)
            return null;

        const {baseColumns, resizable, pageSize, defaultSorted, showPagination} = this.props;

        // Check if we were given some columns to show instead of the default columns
        let columns = [];
        for (const col of BASE_COLUMNS) {
            const correspondingBaseColumn = baseColumns.find(value => col.id === value);
            if (correspondingBaseColumn) {
                columns = [...columns, col]
            }
        }
        columns = [...columns, ...this.props.columns];

        if (!columns) {
            columns = BASE_COLUMNS;
        }

        return (
            <div>
                <Loading loading={loading}/>
                <ReactTable
                    data={data}
                    hidden={loading}
                    resizable={resizable}
                    showPagination={showPagination}
                    defaultSorted={defaultSorted}
                    loading={loading}
                    pageSize={pageSize}
                    className='-loading -striped -highlight'
                    columns={columns}
                    noDataText="No data available for the moment."
                />
            </div>
        );
    }
}
ClanMembersTable.propTypes = {
    resizable: PropTypes.bool.isRequired,
    showPagination: PropTypes.bool.isRequired,
    pageSize: PropTypes.number.isRequired,
    defaultSorted: PropTypes.arrayOf(PropTypes.object).isRequired,
    onFetchData: PropTypes.func.isRequired,
    columns: PropTypes.arrayOf(PropTypes.object),
    baseColumns: PropTypes.arrayOf(PropTypes.string),
};
ClanMembersTable.defaultProps = {
    columns: [],
    resizable: false,
    showPagination: false,
    pageSize: 10,
    defaultSorted: [{id: "rank"}],
    onFetchData: () => {}
};