import React from 'react';
import PropTypes from 'prop-types';
import CriticalError from "./CriticalError";

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);

        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true }
    }

    componentDidCatch(error, info) {
        console.log(error);
        console.log(info);
    }

    render() {
        const { children, errorProps } = this.props;
        const { hasError } = this.state;

        return hasError ? <CriticalError { ...errorProps } /> : children;
    }
}

ErrorBoundary.propTypes = {
    errorProps: PropTypes.object,
};

ErrorBoundary.defaultProps = {
    errorProps: {
        message: "We're very sorry, but something went wrong :(",
    }
};