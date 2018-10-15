import React from 'react'
import moment from 'moment'
import DatePicker from "react-datepicker";
import PropTypes from "prop-types";
import { cookies, getCookie, handleErrors, locale } from "../../helpers/api";

import 'react-datepicker/dist/react-datepicker.css';
import { FontAwesomeIcon } from "../ui/FontAwesome";

export default class DateRangeForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            start: props.start,
            end: props.end,
            loading: false,
            error: undefined,
        };

        this.handleChangeStart = this.handleChangeStart.bind(this);
        this.handleChangeEnd = this.handleChangeEnd.bind(this);
    }

    componentWillReceiveProps(newProps) {
        this.setState({start: newProps.start, end: newProps.end})
    }

    handleChangeStart(event) {
        this.setState({selectedRange: {start: event.target.value}});
    }

    handleChangeEnd(event) {
        this.setState({selectedRange: {end: event.target.value}});
    }

    handleSubmit(event) {
        event.preventDefault();
        const form = new FormData(event.target);
        this.setState({loading: true});
        fetch(this.props.endpoint, {
            method: 'POST',
            body: form,
        })
            .then(res => handleErrors(res))
            .then(result => {
                this.setState({loading: false});
                this.props.handleData(result);
                console.log(result);
            })
            .catch((error) => {
                this.catchErrors(error)
            });
    }
    catchErrors(error) {
        this.setState({loading: false});
        if (error.status === 403 || error.status === 404)
        {
            error.json().then(res => console.log(res));
        }
        else
            console.log(error);
    }

    render() {
        const {start, end} = this.props;
        const {loading, error} = this.state;
        return (
            <form onSubmit={this.handleSubmit} className="input-group date-range">
                <input type="hidden" name="csrfmiddlewaretoken" value={getCookie(cookies.csrf)} />
                <DatePicker
                    className="form-control"
                    locale={locale}
                    selected={start}
                    selectsStart
                    startDate={start}
                    endDate={end}
                    name="start"
                    onChange={this.handleChangeStart}
                />
                <div className="input-group-append input-group-prepend">
                    <span className="input-group-text">to</span>
                </div>
                <DatePicker
                    className="form-control"
                    locale={locale}
                    selected={end}
                    selectsEnd
                    startDate={start}
                    endDate={end}
                    name="end"
                    onChange={this.handleChangeEnd}
                />
                <div className="input-group-append">
                    <button type="submit"
                            className="btn btn-primary"
                            disabled={loading || error}>
                        {loading && <FontAwesomeIcon icon="sync" spin/>}
                        {!loading && 'Submit'}
                    </button>
                </div>
            </form>
        )
    }
}
DateRangeForm.propTypes = {
    endpoint: PropTypes.string.isRequired,
    handleData: PropTypes.func.isRequired,
};
DateRangeForm.defaultProps = {
    start: moment().subtract(2, 'week'),
    end: moment(),
    loading: false,
};