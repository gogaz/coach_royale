import React from 'react'
import moment from 'moment'
import ReactTooltip from 'react-tooltip'
import Loading from "../ui/Loading";

export default class ClanPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            clanError: null,
            isClanLoaded: false,
            clan: null,
            membersError: null,
            isMembersLoaded: false,
            members: [],
        }
    }

    componentDidMount() {
        const endPoint = "/api/clan/" + this.props.match.params.tag;
        fetch(endPoint)
            .then((res) => res.json())
            .then(
                (result) => {
                    this.setState({isClanLoaded: true, clan: result});
                    console.log(result);
                })
            .catch((error) => {
                    this.setState({isClanLoaded: true, clanError: error});
                    console.log(error);
                });
        fetch(endPoint + '/members')
            .then((res) => res.json())
            .then(
                (result) => {
                    console.log(result)
                })
            .catch((error) => {console.log(error)})
    }

    render() {
        let last_refresh = {fromNow: () => {}, format: () => {}};
        if (this.state.clan)
            last_refresh = moment(this.state.clan.last_refresh);
        return (
            <div className="row">
                <div className="col-12">
                    <div className="card">
                        <div className="card-header">
                            <Loading loading={!this.state.isClanLoaded}/>
                            { this.state.isClanLoaded && (
                                <div style={{display: 'inline-block', marginTop: '1.5rem !important', marginLeft: "10px"}}>
                                    <h3 className="supercell">
                                        { this.state.clan.name }
                                    </h3>
                                    <small>
                                        <span className="text-muted text-uppercase text-light" data-tip="some placeholder">
                                            Last refresh {last_refresh.fromNow()}
                                        </span>
                                        <ReactTooltip place="bottom" type="dark" effect="solid">{last_refresh.format('L') + ' ' + last_refresh.format('LTS')}</ReactTooltip>
                                    </small>
                                </div>)
                            }
                            { this.state.isClanLoaded && <img src={this.state.clan.details.badge} style={{float: 'right', height: '2.5pc'}} /> }
                        </div>
                        <div className="card-body">
                            <Loading loading={!this.state.isMembersLoaded}/>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}