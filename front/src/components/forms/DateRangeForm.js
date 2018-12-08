import React from 'react'
import moment from 'moment'
import DatePicker from "react-datepicker";
import PropTypes from "prop-types";
import { handleErrors } from "../../helpers/api";
import { cookies, locale } from "../../helpers/browser";

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
            changed: true,
        };

        this.handleChangeStart = this.handleChangeStart.bind(this);
        this.handleChangeEnd = this.handleChangeEnd.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }
    componentWillReceiveProps(newProps) {
        this.setState({start: newProps.start, end: newProps.end})
    }
    handleChangeStart(value) {
        this.setState({
            start: value,
            changed: true,
        });
    }
    handleChangeEnd(value) {
        this.setState({
            end: value,
            changed: true,
        });
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
                this.setState({
                    loading: false,
                    changed: false,
                });
                this.props.handleData(result);
                console.log(result);
            })
            .catch((error) => {
                this.catchErrors(error)
            });
    }
    catchErrors(error) {
        if (error.status === 403 || error.status === 404)
        {
            error.json().then(res => console.log(res));
        }
        else
            console.log(error);
    }

    render() {
        const {loading, error, changed, start, end} = this.state;
        return (
            <form onSubmit={this.handleSubmit} className="input-group date-range">
                <input type="hidden" name="csrfmiddlewaretoken" value={cookies.csrf} />
                <DatePicker
                    className="form-control"
                    locale={locale}
                    selected={start.toDate()}
                    selectsStart
                    startDate={start.toDate()}
                    endDate={end.toDate()}
                    autoComplete="off"
                    name="start"
                    onChange={this.handleChangeStart}
                    dropdownMode={'scroll'}
                />
                <div className="input-group-append input-group-prepend">
                    <span className="input-group-text">to</span>
                </div>
                <DatePicker
                    className="form-control"
                    locale={locale}
                    selected={end.toDate()}
                    selectsEnd
                    startDate={start.toDate()}
                    endDate={end.toDate()}
                    autoComplete="off"
                    name="end"
                    onChange={this.handleChangeEnd}
                    dropdownMode={'scroll'}
                />
                <div className="input-group-append">
                    <button type="submit"
                            className="btn btn-primary"
                            disabled={loading || changed === false || error}>
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