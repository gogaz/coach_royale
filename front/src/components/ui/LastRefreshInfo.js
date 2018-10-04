import React from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ReactTooltip from 'react-tooltip';
import moment from 'moment'
import { handleErrors } from "../../helpers/api";

export default class LastRefreshInfo extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            now: moment(),
            intervalID: undefined,
            error: undefined,
            refreshing: false,
        };
        this.updateComponent = this.updateComponent.bind(this);
        this.catchErrors = this.catchErrors.bind(this);
    }

    updateComponent() {
        this.setState({now: moment()});
    }

    componentDidMount() {
        if (this.props.update > 0) {
            this.setState({intervalID: setInterval(this.updateComponent, this.props.update * 1000)})
        }
    }

    componentWillUnmount() {
        clearInterval(this.state.intervalID);
    }

    refreshData(url) {
        this.setState({refreshing: true});
        fetch(url, {method: 'POST'})
            .then(res => handleErrors(res))
            .then(res => {
                this.setState({data: res, refreshing: false});
                this.props.handleData(res);
            })
            .catch(error => this.catchErrors(error));
    }

    catchErrors(e) {
        this.setState({refreshing: false});
        if (e.status === 403 || e.status === 500)
            e.json()
                .then(res => {
                    this.setState({error: res.error.message})
                })
                .catch(err => console.log(err))
            ;
        else
            this.setState({error: "An unknown error occurred."});
        setTimeout(() => {this.setState({error: undefined})}, 30 * 1000)
    }

    render() {
        const { refreshable, time, url } = this.props;
        const { refreshing, error, now } = this.state;
        const last_refresh = moment(time);

        return (
            <small className="last-refresh-info">
                <span className="text-muted text-uppercase" data-tip="last refreshed">
                    Last refresh {now && last_refresh.fromNow()}
                </span>
                <ReactTooltip place="bottom" type="dark" effect="solid">
                    {last_refresh.format('L') + ' ' + last_refresh.format('LTS')}
                </ReactTooltip>
                <button className="btn btn-xs ml-1"
                        hidden={!refreshable || error !== undefined || now.diff(last_refresh) < (15 * 60 * 1000)}
                        onClick={() => this.refreshData(url)}
                        disabled={refreshing}>
                    <FontAwesomeIcon icon="sync" spin={refreshing} />
                </button>
                <br/>
                { error &&
                    <span className="badge badge-warning"><FontAwesomeIcon icon='exclamation-triangle'/> {error}</span>
                }
            </small>
        );
    }
}

LastRefreshInfo.defaultProps = {
    refreshable: false,
    update: 15,
    handleData: d => {},
    url: '',
    time: 0
};