import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment'

const useForceUpdate = () => {
    const [value, setValue] = useState(0); // integer state
    return () => setValue(value => ++value); // update the state to force render
};

const TimeFromNow = ({ time, update }) => {
    const forceUpdate = useForceUpdate();

    useEffect(() => {
        const interval = setInterval(forceUpdate, Math.round(update * 1000));
        return () => clearInterval(interval);
    });

    let timeObject = time;
    if (!(time instanceof moment)) timeObject = moment(time);

    if (!(timeObject.isValid())) return "unknown";
    return timeObject.fromNow()
};

TimeFromNow.defaultProps = {
    update: 30, // in seconds
};

TimeFromNow.propTypes = {
    update: PropTypes.number,
    time: PropTypes.object.isRequired,
};

export default TimeFromNow;