import React from 'react'
import PropTypes from 'prop-types';

const Loading = ({ height, loading }) => {
    if (!loading)
        return null;

    const imageProps = {
        src: "/static/img/loading.svg",
        alt: "Loading...",
    };

    if (height)
        return <img style={ { height: height, display: 'inline-block' } } { ...imageProps }/>;

    return (
        <React.Fragment>
            <div style={ { height: "50%" } }>&nbsp;</div>
            <img className="d-block mx-auto" { ...imageProps } />
        </React.Fragment>
    );
};

Loading.defaultProps = { loading: true, height: null };
Loading.propTypes = {
    loading: PropTypes.bool,
    height: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]),
};

export default Loading;