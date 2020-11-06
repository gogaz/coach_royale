import React, { useState } from 'react';
import moment from 'helpers/moment'
import PropTypes from 'prop-types';
import ReactTooltip from 'react-tooltip';
import axios from 'axios'
import { withTheme } from 'styled-components'

import { handleErrors } from 'helpers/api'

import FontAwesomeIcon from './FontAwesome';
import TimeFromNow from './TimeFromNow'

const LastRefreshInfo = ({ theme, refreshable, time, url, allowRefreshAfter, handleData }) => {
    const [data, setData] = useState({});
    const [now, setNow] = useState(moment());
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const lastRefresh = moment(time);

    const catchErrors = (error) => {
        setRefreshing(false);
        if (error.status === 403 || error.status === 500)
            error.json()
                .then(res => setError(res.error.message))
                .catch(err => console.log(err))
            ;
        else
            setError("An unknown error occurred");

        setTimeout(() => setError(null), 30 * 1000)
    };

    const refreshData = () => {
        setRefreshing(true);
        axios.get(url, { method: 'POST' })
            .then(res => handleErrors(res))
            .then(res => {
                setData(data);
                setRefreshing(false);
                handleData(res);
            })
            .catch(error => catchErrors(error));
    };

    return (
        <small className="last-refresh-info">
            <span className="text-muted text-uppercase" data-tip data-for="lastRefreshed">
                Last refresh <TimeFromNow time={ lastRefresh }/>
            </span>
            <ReactTooltip place="bottom" type="dark" effect="solid" id="lastRefreshed">
                { lastRefresh.format('L') } { lastRefresh.format('LTS') }
            </ReactTooltip>
            <button className="btn btn-xs ml-1"
                    hidden={ !refreshable || error !== undefined || now.diff(lastRefresh) < allowRefreshAfter }
                    onClick={ refreshData }
                    disabled={ refreshing }>
                <FontAwesomeIcon icon="sync" spin={ refreshing }/>
            </button>
            <br/>
            { error !== null && (
                <span className="badge badge-warning">
                    <FontAwesomeIcon icon='exclamation-triangle' color={ theme.colors.orange }/>
                    { error }
                </span>
            )}
        </small>
    );
};

LastRefreshInfo.defaultProps = {
    refreshable: false,
    update: 30,
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
