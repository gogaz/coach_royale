import React from 'react';
import ReactTable from "react-table";
import { images } from "../../helpers/assets"
import { Link } from "react-router-dom";
import DonationCell from "./cells/DonationCell";
import { locale } from "../../helpers/api";


export default class ClanMembers extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            data: [],
            loading: true,
            endpoint: props.endpoint + '/members'
        };
    }

    componentDidMount() {
        fetch(this.state.endpoint)
            .then((res) => res.json())
            .then(
                (result) => {
                    this.setState({data: result});
                    console.log(result)
                })
            .then(() => this.setState({loading: false}))
            .catch((error) => {
                console.log(error)
            });
    }

    render() {
        const {data, loading} = this.state;
        const roles = {elder: 'Elder', coLeader: "Co-Leader", leader: "Leader", member: "Member"};
        return (
            <ReactTable
                data={data}
                columns={[
                    {
                        Header: "Rank",
                        id: "rank",
                        accessor: "details.current_clan_rank",
                        width: 45
                    },
                    {
                        Header: "Name",
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
                            return (<span className="trophy-td">
                                <img src={images.arenaX(original.details.arena)} />
                                {Number(row.trophies).toLocaleString(locale)}
                            </span>)
                        }
                    },
                    {
                        Header: "Level",
                        accessor: "details.level",
                        id: 'level',
                        width: 45,
                        Cell: ({row}) => (<span className="level-td" style={{backgroundImage: 'url('+images.level+')'}}>{row.level}</span>)
                    },
                    {
                        Header: "Role",
                        id: "role",
                        accessor: "details.clan_role",
                        width: 100,
                        Cell: ({row}) => {
                            return roles[ row.role ]
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
                ]}
                resizable={false}
                defaultSorted={[ {id: "rank"} ]}
                loading={loading}
                pageSize={data.length}
                showPagination={false}
            />
        );
    }
}