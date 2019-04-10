import React from 'react';
import PropTypes from 'prop-types'
import ReactTable from "react-table";
import { images } from "../../helpers/assets"
import { Link } from "react-router-dom";
import DonationCell from "./cells/DonationCell";
import Loading from "../ui/Loading";
import TrophiesCell from "./cells/TrophiesCell";


export default class ClanMembersTable extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            data: [],
            loading: true,
            endpoint: props.endpoint,
        };
    }

    componentDidMount() {
        fetch(this.state.endpoint)
            .then((res) => res.json())
            .then(
                (result) => {
                    this.setState({data: result});
                    this.props.onFetchData(result);
                })
            .then(() => this.setState({loading: false}))
            .catch((error) => {
                console.log(error)
            });
    }

    render() {
        const {data, loading} = this.state;
        if (!data && !loading)
            return null;
        const _cols = this.props.columns;
        const {resizable, pageSize, defaultSorted} = this.props;
        const roles = {elder: 'Elder', coLeader: "Co-Leader", leader: "Leader", member: "Member"};
        const base_columns = [
            {
                Header: "Rank",
                id: "rank",
                accessor: "details.current_clan_rank",
                width: 45
            },
            {
                Header: "Name",
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
                Cell: ({row, original}) => <TrophiesCell trophies={row.trophies} arena={original.details.arena} />
            },
            {
                Header: "Level",
                accessor: "details.level",
                id: 'level',
                width: 45,
                Cell: ({row}) => (<span className="level-td" style={{backgroundImage: 'url('+images.static('level')+')'}}>{row.level}</span>)
            },
            {
                Header: "Role",
                id: "role",
                accessor: "details.clan_role",
                width: 100,
                Cell: ({row}) => {
                    return roles[row.role]
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
        let columns = [];
        if (!_cols || _cols.length === 0) {
            columns = base_columns;
        }
        else {
            for (let col of _cols) {
                if (typeof col === 'object') {
                    columns = [...columns, col];
                }
                else {
                    columns = [...columns, base_columns.find(value => value.id === col)]
                }
            }
        }

        return (
            <div>
                <Loading loading={loading}/>
                <ReactTable
                    data={data}
                    hidden={loading}
                    resizable={resizable}
                    defaultSorted={defaultSorted}
                    loading={loading}
                    pageSize={pageSize}
                    className='-striped -highlight'
                    columns={columns}
                />
            </div>
        );
    }
}
ClanMembersTable.propTypes = {
    columns: PropTypes.arrayOf(PropTypes.oneOf(['rank', 'name', 'trophies', 'level', 'role', 'given', 'received', 'total', PropTypes.object])),
};
ClanMembersTable.defaultProps = {
    resizable: false,
    pageSize: 10,
    defaultSorted: [{id: "rank"}],
    onFetchData: () => {}
};