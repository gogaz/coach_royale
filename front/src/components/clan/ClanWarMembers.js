import React from 'react';
import ReactTable from "react-table";
import moment from 'moment'
import { Link } from "react-router-dom";
import Loading from "../ui/Loading";
import PlayerWarResultCell from "./cells/PlayerWarResultCell";
import '../../style/indicators.css';
import { locale } from "../../helpers/api";
import { images } from "../../helpers/assets";
import DateRangeForm from "../forms/DateRangeForm";

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
            .then((res) => res.json())
            .then(result => {
                this.setState({data: result, loading: false});
                console.log(result);
            })
            .catch((error) => {
                console.log(error)
            });
    }

    render() {
        /*
         * TODO: all available columns +/- visibility
         * TODO: Filters
         * TODO: date range picker (backend)
         */
        let columns = [
            {
                Header: <img src={images.trophy} height={20}/>,
                id: 'trophies',
                className: "text-right",
                accessor: "details.trophies",
                width: 50,
                Cell: ({row}) => Number(row.trophies).toLocaleString(locale)
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
            },
            {
                Header: "Win %",
                id: "winrate",
                className: 'indicator-container',
                width: 70,
                accessor: (data) => {
                    const wins = data.wars.reduce((acc, elem) => acc + elem.final_battles_wins, 0);
                    const battles = data.wars.reduce((acc, elem) => acc + elem.final_battles_done, 0);
                    return battles > 0 ? (wins / battles) * 100 : 0;
                },
                Cell: ({row}) => {
                    let color = {r: 255, g: 255, b: 255};
                    if (row.winrate < 50 && row.winrate !== null)
                        color = {r: 255, g: 100 + 3 * row.winrate, b: 105 + 3 * row.winrate};
                    if (row.winrate > 50)
                        color = {g: 255, r: 250 - row.winrate, b: 255 - row.winrate};
                    return (
                    <div style={{padding: 'inherit'}}>
                        <div className="indicator"
                             style={{backgroundColor: `rgb(${color.r}, ${color.g}, ${color.b})`}}
                        />
                        <div className="indicator-data text-right">
                            {row.winrate !== null && Number(row.winrate).toLocaleString(locale, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            }) + '%'}
                        </div>
                    </div>
                )},
            },
            {
                Header: <img src={images.battle} height={20}/>,
                className: "text-right",
                id: "count",
                width: 40,
                accessor: (data) => data.wars.reduce((acc, elem) => acc + elem.final_battles_done, 0),
            },
            {
                Header: <img src={images.warYet} height={20}/>,
                className: "text-right",
                id: "count_missing",
                width: 40,
                accessor: (data) => data.wars.reduce((acc, elem) => acc + (elem.final_battles_done === 0 ? 1 : 0), 0),
            }
        ];
        const { data: {wars, members}, loading } = this.state;
        if (wars)
        wars.map(e => {
            const date = moment(e.date_start).format('DD/MM');
            const column = {
                Header: date,
                id: 'war' + e.id,
                width: 65,
                Cell: ({row, original}) => <PlayerWarResultCell warId={e.id} wars={original.wars}/>,
                sortable: false,
            };
            columns = [...columns, column]
        });

        const end_date = wars.reduce((acc, e) => e.end_date < acc ? e.end_date : acc, moment().toISOString());
        console.log(end_date);
        return (
            <div>
                <DateRangeForm endpoint={this.state.endpoint}
                               handleData={(data) => this.setState({data: data})}
                               start={moment(end_date)}
                />
                <Loading loading={loading}/>
                <ReactTable
                    data={members}
                    columns={columns}
                    resizable={false}
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