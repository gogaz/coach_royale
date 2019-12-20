import React from 'react';
import moment from 'moment'
import PropTypes from 'prop-types';
import ReactTooltip from 'react-tooltip';
import axios from "axios";
import {withTheme} from "styled-components";

import { handleErrors } from "../../helpers/api";

import FontAwesomeIcon from './FontAwesome';
import TimeFromNow from "./TimeFromNow";

class LastRefreshInfo extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            now: moment(),
            error: undefined,
            refreshing: false,
        };
        this.catchErrors = this.catchErrors.bind(this);
    }

    refreshData(url) {
        this.setState({refreshing: true});
        axios.get(url, {method: 'POST'})
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
        const { refreshable, time, url, allowRefreshAfter, theme } = this.props;
        const { refreshing, error, now } = this.state;
        const lastRefresh = moment(time);

        return (
            <small className="last-refresh-info">
                <span className="text-muted text-uppercase" data-tip data-for="lastRefreshed">
                    Last refresh <TimeFromNow time={lastRefresh}/>
                </span>
                <ReactTooltip place="bottom" type="dark" effect="solid" id="lastRefreshed">
                    {lastRefresh.format('L')} {lastRefresh.format('LTS')}
                </ReactTooltip>
                <button className="btn btn-xs ml-1"
                        hidden={!refreshable || error !== undefined || now.diff(lastRefresh) < allowRefreshAfter}
                        onClick={() => this.refreshData(url)}
                        disabled={refreshing}>
                    <FontAwesomeIcon icon="sync" spin={refreshing} />
                </button>
                <br/>
                { error !== undefined &&
                    <span className="badge badge-warning"><FontAwesomeIcon icon='exclamation-triangle' color={theme.colors.orange}/> {error}</span>
                }
            </small>
        );
    }
}

LastRefreshInfo.defaultProps = {
    refreshable: false,
    update: 15,
    handleData: d => {},
    allowRefreshAfter: 15 * 60 * 1000, // 15 minutes
    url: '',
    time: moment().subtract(100, 'year').format(),
};

LastRefreshInfo.propTypes = {
    refreshable: PropTypes.bool,
    update: PropTypes.number,
    handleData: PropTypes.func,
    allowRefreshAfter: PropTypes.number,
    url: PropTypes.string,
    time: PropTypes.string,
};

export default withTheme(LastRefreshInfo);