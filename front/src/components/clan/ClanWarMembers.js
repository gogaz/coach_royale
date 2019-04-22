import React from 'react';
import ReactTable from "react-table";
import moment from 'moment'
import { Link } from "react-router-dom";
import Loading from "../ui/Loading";
import PlayerWarResultCell from "./cells/PlayerWarResultCell";
import '../../style/indicators.css';
import { locale } from "../../helpers/browser";
import { images } from "../../helpers/assets";
import DateRangeForm from "../forms/DateRangeForm";
import { handleErrors } from "../../helpers/api";
import TrophiesCell from "./cells/TrophiesCell";

export default class ClanWarMembers extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            endpoint: this.props.endpoint + '/wars',
            data: { wars: [], members: [] },
            loading: true,
        };
    }
    componentDidMount() {
        fetch(this.state.endpoint)
            .then(res => handleErrors(res))
            .then(result => {
                this.setState({data: result, loading: false});
            })
            .catch((error) => {
                console.log(error)
            });
    }

    render() {
        const { data: {wars, members}, loading } = this.state;
        if (wars === undefined || !wars.length) return <Loading/>;
        let columns = [
            {
                Header: <img src={images.static('trophy')} height={20}/>,
                id: 'trophies',
                className: "text-right",
                accessor: "details.trophies",
                width: 80,
                Cell: ({row, original}) => <TrophiesCell trophies={row.trophies} arena={original.details.arena} />,
                filterable: false,
            },
            {
                Header: "Name",
                accessor: "name",
                Cell: ({row, original}) => {
                    return <Link to={"/player/" + original.tag}>{row.name}</Link>
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
                Filter: ({filter, onChange}) =>
                    <select
                        onChange={event => onChange(event.target.value)}
                        style={{width: "100%"}}
                        value={filter ? filter.value : "all"}>
                        <option value="all">All</option>
                        <option value="member">Members</option>
                        <option value="elder">Elders</option>
                        <option value="coLeader">Co-Leaders</option>
                    </select>
            },
            {
                Header: "Win %",
                id: "winrate",
                className: 'indicator-container',
                width: 70,
                accessor: (data) => {
                    const wins = data.wars.reduce((acc, elem) => acc + elem.final_battles_wins, 0);
                    const battles = data.wars.reduce((acc, elem) => acc + (elem.final_battles_done || 1), 0);
                    return battles > 0 ? (wins / battles) * 100 : -1;
                },
                Cell: ({row}) => {
                    if (row.winrate < 0) {
                        return <div className="indicator empty" />
                    }
                    let color = {r: 255, g: 255, b: 255};
                    if (row.winrate < 50 && row.winrate !== null)
                        color = {r: 230 + row.winrate / 5, g: 100 + 2.5 * row.winrate, b: 105 + 2.5 * row.winrate};
                    if (row.winrate > 50)
                        color = {g: 230 + (100 - row.winrate) / 3, r: 250 - 2.5 * (row.winrate - 50), b: 255 - 2.5 * (row.winrate - 50)};
                    return (
                        <div style={{padding: 'inherit'}}>
                            <div className="indicator" style={{backgroundColor: `rgba(${color.r}, ${color.g}, ${color.b}, 1)`}} />
                            <div className="indicator-data text-right">
                                {row.winrate !== null && Number(row.winrate).toLocaleString(locale, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                }) + '%'}
                            </div>
                        </div>
                    )},
                filterMethod: (filter, row) => {
                    if (filter.value === "all")
                        return true;
                    else if (filter.value === "grey")
                        return row.winrate < 0;
                    else if (filter.value === "red")
                        return row.winrate < 50 && row.winrate >= 0;
                    return row.winrate >= 50;
                },
                Filter: ({filter, onChange}) =>
                    <select
                        onChange={event => onChange(event.target.value)}
                        style={{width: "100%"}}
                        value={filter ? filter.value : "all"}>
                        <option value="all">All</option>
                        <option value="green" style={{backgroundColor: '#7de682'}}>&gt;= 50%</option>
                        <option value="red" style={{backgroundColor: '#e66469'}}>&lt; 50%</option>
                        <option value="grey" style={{backgroundColor: '#ccc'}}>None</option>
                    </select>
            },
            {
                Header: <img src={images.static('battle')} height={20}/>,
                className: "text-right",
                id: "count",
                width: 40,
                filterable: false,
                accessor: (data) => data.wars.reduce((acc, elem) => acc + elem.final_battles_done, 0),
            },
            {
                Header: <img src={images.static('warYet')} height={20}/>,
                className: "text-right",
                id: "count_missing",
                width: 40,
                filterable: false,
                accessor: (data) => data.wars.reduce((acc, elem) => acc + (elem.final_battles_done === 0 ? 1 : 0), 0),
            }
        ];

        wars.map(e => {
            const date = moment(e.date_start).format('DD/MM');
            const column = {
                Header: date,
                id: 'war' + e.id,
                width: 65,
                Cell: ({row, original}) => <PlayerWarResultCell war={original.wars.find(value => value.clan_war_id === e.id)}/>,
                sortable: false,
                filterable: false,
            };
            columns = [...columns, column]
        });

        const end_date = wars.reduce((acc, e) => e.date_start, 0);
        return (
            <div>
                <DateRangeForm endpoint={this.state.endpoint}
                               handleData={(data) => this.setState({data: data})}
                               start={moment(end_date)}
                />
                <Loading loading={loading}/>
                <ReactTable
                    className='-striped -highlight'
                    data={members}
                    columns={columns}
                    resizable={false}
                    filterable
                    defaultSorted={[{id: "rank"}]}
                    hidden={loading}
                    loading={loading}
                    pageSize={members.length}
                    showPagination={false}
                />
            </div>
        );
    }
}