import React from 'react'
import PropTypes from 'prop-types';

export default class Loading extends React.Component {
    render() {
        const {height, loading} = this.props;

        if (!loading)
            return null;

        if (height)
            return <img hidden={!loading} src={ '/img/loading.svg' } style={{height: height, display: 'inline-block'}} />;

        return (
            <React.Fragment>
                <div style={ {height: "50%"} }> </div>
                <img className="d-block mx-auto" src={ '/img/loading.svg' } />
            </React.Fragment>
        );
    }
}
Loading.defaultProps = {loading: true, height: null};
Loading.propTypes = {
    loading: PropTypes.bool,
    height: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]),
};