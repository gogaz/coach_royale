import React from 'react';
import ReactTable from "react-table";
import { images } from "../../helpers/assets"
import { FontAwesomeIcon } from '../ui/FontAwesome';
import { Link } from "react-router-dom";


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
                        minWidth: 70,
                        Cell: ({row, original}) => {
                            return (<span className="trophy-td">
                                <img src={images.arenaX(original.details.arena)} />
                                {row.trophies}
                            </span>)
                        }
                    },
                    {
                        Header: "Level",
                        accessor: "details.level",
                        minWidth: 50
                    },
                    {
                        Header: "Role",
                        id: "role",
                        accessor: "details.clan_role",
                        minWidth: 80,
                        Cell: ({row}) => {
                            return roles[ row.role ]
                        }
                    },
                    {
                        Header: "Received",
                        id: "received",
                        accessor: "details.donations_received",
                        width: 80,
                        Cell: ({row}) => {
                            return (<span>{row.received}
                                <i className="donations-icons">
                                    <img src={images.cardsWar} /><span className="text-danger"><FontAwesomeIcon icon="arrow-down" /></span>
                                </i>
                            </span>)
                        }
                    },
                    {
                        Header: "Donated",
                        id: "given",
                        accessor: "details.donations",
                        width: 80,
                        Cell: ({row}) => {
                            return (<span>{row.given}
                                <i className="donations-icons">
                                    <img src={images.cardsWar} /><span className="text-primary"><FontAwesomeIcon icon="arrow-up" /></span>
                                </i>
                            </span>)
                        }
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