import React from 'react';
import ReactTable from "react-table";
import StatusCell from "./cells/StatusCell";
import moment from 'moment'

export default class TournamentsTable extends React.Component {
    render() {
        const {data, loading, resizable, pageSize} = this.props;
        const now = moment();
        return (
            <ReactTable
                data={data}
                loading={loading}
                resizable={resizable}
                defaultPageSize={pageSize}
                filterable
                sortable
                className="-striped -highlight"
                defaultSorted={[{id: 'status', desc: true}, {id: 'start_time', desc: true}, {id: 'current_players', desc: true}]}
                columns={[
                    {
                        Header: "Name",
                        accessor: "name",
                        Cell: ({row, original}) => <span>{row.name} <small className="text-muted">#{original.tag}</small></span>
                    },
                    {
                        Header: "Players",
                        accessor: 'current_players',
                        Cell: ({row}) => row.current_players + ' / ' + row.max_players,
                        filterMethod: (filter, row) => {
                            if (filter.value === "all") {
                                return true;
                            }
                            return row.max_players.toString() === filter.value;
                        },
                        Filter: ({filter, onChange}) =>
                            <select
                                onChange={event => onChange(event.target.value)}
                                style={{width: "100%"}}
                                value={filter ? filter.value : "all"}>
                                <option value="all">All</option>
                                <option value="50">50 Players</option>
                                <option value="100">100 Players</option>
                                <option value="200">100 Players</option>
                                <option value="1000">1000 Players</option>
                            </select>
                    },
                    {
                        Header: "Status",
                        id: 'status',
                        accessor: (row) => {
                            if (now.isBefore(row.start_time) && now.isSameOrAfter(row.create_time))
                                return "preparation";
                            else if (now.isBefore(row.end_time) && now.isSameOrAfter(row.start_time))
                                return "progress";
                            return "ended";
                        },
                        Cell: ({ row }) => {
                            return <StatusCell data={row} />
                        },
                        filterMethod: (filter, row) => {
                            if (filter.value === "all") {
                                return true;
                            }
                            return row.status === filter.value;
                        },
                        Filter: ({filter, onChange}) =>
                            <select
                                onChange={event => onChange(event.target.value)}
                                style={{width: "100%"}}
                                value={filter ? filter.value : "all"}>
                                <option value="all">All</option>
                                <option value="progress">In progress</option>
                                <option value="preparation">In preparation</option>
                            </select>
                    },
                    {
                        id: 'create_time',
                        accessor: (row) => moment(row.create_time),
                        show: false
                    },
                    {
                        id: 'start_time',
                        accessor: (row) => moment(row.start_time),
                        show: false
                    },
                    {
                        id: 'max_players',
                        accessor: 'max_players',
                        show: false
                    },
                    {
                        id: 'duration',
                        accessor: 'duration',
                        show: false
                    },
                    {
                        id: 'prep_time',
                        accessor: 'prep_time',
                        show: false
                    },
                    {
                        Header: "End time",
                        id: 'end_time',
                        accessor: (row) => moment(row.end_time),
                        Cell: ({row}) => row.end_time.format('LTS'),
                        width: 110,
                        show: true
                    },
                ]}
            />
        );
    }
}
TournamentsTable.defaultProps = {data: [], loading: true, resizable: false, pageSize: 20};