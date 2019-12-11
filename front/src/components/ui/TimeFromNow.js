import React from 'react';
import PropTypes from 'prop-types';
import moment from "moment";

export default class TimeFromNow extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            intervalID: undefined,
            now: 0,
        };

        this.updateComponent = this.updateComponent.bind(this);
    }

    updateComponent() {
        this.setState({now: moment().unix()});
    }

    componentDidMount() {
        if (this.props.update > 0) {
            this.setState({intervalID: setInterval(this.updateComponent, Math.round(this.props.update * 1000))})
        }
    }

    componentWillUnmount() {
        clearInterval(this.state.intervalID);
    }

    render() {
        const {time} = this.props;

        let timeObject = time;
        if (!(time instanceof moment)) timeObject = moment(time);

        if (!(timeObject.isValid())) return "unknown";
        return timeObject.fromNow()
    }
}

TimeFromNow.defaultProps = {
    update: 15,
};

TimeFromNow.propTypes = {
    update: PropTypes.number.isRequired,
    time: PropTypes.object.isRequired,
};