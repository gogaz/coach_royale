import React from 'react'
import moment from 'moment'
import axios from "axios";
import DatePicker from "react-datepicker";
import PropTypes from "prop-types";
import { handleErrors } from "../../helpers/api";
import { cookies, getLocaleDateString } from "../../helpers/browser";

// import 'react-datepicker/dist/react-datepicker.css';
import FontAwesomeIcon from "../ui/FontAwesome";

export default class DateRangeForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            start: props.start.toDate(),
            end: props.end.toDate(),
            loading: false,
            error: undefined,
            changed: false,
        };

        this.handleChangeStart = this.handleChangeStart.bind(this);
        this.handleChangeEnd = this.handleChangeEnd.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }
    componentWillReceiveProps(newProps) {
        this.setState({start: newProps.start.toDate(), end: newProps.end.toDate()})
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
        axios({
            method: 'POST',
            url: this.props.endpoint,
            data: form,
            headers: {'Content-Type': 'multipart/form-data'}
        })
            .then(res => handleErrors(res))
            .then(result => {
                this.setState({
                    loading: false,
                    changed: false,
                });
                this.props.handleData(result);
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
                <input type="hidden" name="csrfmiddlewaretoken" value={cookies.csrf() || ''} />
                <DatePicker
                    className="form-control"
                    selected={start}
                    dateFormat={getLocaleDateString()}
                    selectsStart
                    startDate={start}
                    endDate={end}
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
                    selected={end}
                    dateFormat={getLocaleDateString()}
                    selectsEnd
                    startDate={start}
                    endDate={end}
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