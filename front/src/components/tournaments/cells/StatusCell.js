import React from 'react';

const moment = require('moment');

require('../../../helpers/api');

export default class StatusCell extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            now: moment(),
            //intervalID: undefined,
        };

        //this.onTick = this.onTick.bind(this);
    }
    /*
    componentDidMount() {
        setInterval(this.onTick, this.props.interval * 1000)
    }
    componentWillUnmount() {
        clearInterval(this.state.intervalID);
    }
    onTick() {
        this.setState({now: moment()})
    }*/
    render() {
        let { now, } = this.state;
        let { data } = this.props;
        let width = '100%',
            diff = 0,
            statusString = data.status === "ended" ? "Ended" : "In " + data.status;

        if (now.isBefore(data.end_time) && now.isSameOrAfter(data.start_time)) {
            diff = data.end_time.diff(now, 'seconds');
            width = Math.floor((data.duration - diff) / (data.duration) * 100);
        }
        else if (now.isBefore(data.start_time) && now.isSameOrAfter(data.create_time)) {
            diff = data.start_time.diff(now, 'seconds');
            width = Math.floor((data.prep_time - diff) / data.prep_time * 100);
        }

        return (
            <div className="row">
                <div className="col-12 col-md-6 col-lg-4">
                    {statusString}
                </div>
                <div className="col-12 col-md-6 col-lg-8">
                    <div className="progress">
                        <div className="progress-bar" role="progressbar"
                             style={{width: Number(width).toString() + '%'}}>
                            {now.isBefore(data.end_time) && moment.duration(diff * 1000).format('h:mm:ss')}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
StatusCell.defaultProps = {interval: 60};