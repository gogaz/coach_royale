import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import axios from 'axios'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css';

import { handleErrors } from 'helpers/api'
import { cookies, getLocaleDateString } from 'helpers/browser'
import FontAwesomeIcon from 'components/ui/FontAwesome'


const DateRangeForm = ({ start, end, endpoint, handleData }) => {
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [loading, setLoading] = useState(false);
    const [changed, setChanged] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        setStartDate(start.toDate());
        setEndDate(end.toDate());
    }, [start, end]);

    const handleChangeStart = (value) => {
        setStartDate(value);
        setChanged(true);
    };
    const handleChangeEnd = (value) => {
        setEndDate(value);
        setChanged(true);
    };
    const catchErrors = (error) => {
        setError(true);
        if (error.status === 403 || error.status === 404)
            error.then(res => console.log(res));
        else
            console.log(error);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const form = new FormData(event.target);
        setLoading(true);
        axios({
            method: 'POST',
            url: endpoint,
            data: form,
            headers: { 'Content-Type': 'multipart/form-data' }
        })
            .then(res => handleErrors(res))
            .then(result => {
                setChanged(false);
                handleData(result.data);
                setLoading(false);
            })
            .catch((error) => {
                catchErrors(error)
            });
    };

    return (
        <form onSubmit={ handleSubmit } className="input-group date-range">
            <input type="hidden" name="csrfmiddlewaretoken" value={ cookies.csrf() || '' }/>
            <DatePicker
                className="form-control"
                selected={ startDate }
                dateFormat={ getLocaleDateString() }
                selectsStart
                startDate={ startDate }
                endDate={ endDate }
                autoComplete="off"
                name="start"
                onChange={ handleChangeStart }
                dropdownMode={ 'scroll' }
            />
            <div className="input-group-append input-group-prepend">
                <span className="input-group-text">to</span>
            </div>
            <DatePicker
                className="form-control"
                selected={ endDate }
                dateFormat={ getLocaleDateString() }
                selectsEnd
                startDate={ startDate }
                endDate={ endDate }
                autoComplete="off"
                name="end"
                onChange={ handleChangeEnd }
                dropdownMode={ 'scroll' }
            />
            <div className="input-group-append">
                <button type="submit"
                        className="btn btn-primary"
                        disabled={ loading || changed === false || error }>
                    { loading && <FontAwesomeIcon icon="sync" spin/> }
                    { !loading && 'Submit' }
                </button>
            </div>
        </form>
    )
};

DateRangeForm.propTypes = {
    endpoint: PropTypes.string.isRequired,
    handleData: PropTypes.func.isRequired,
};

DateRangeForm.defaultProps = {
    start: moment().subtract(2, 'week'),
    end: moment(),
    loading: false,
};

export default DateRangeForm;