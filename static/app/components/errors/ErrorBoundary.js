import React from 'react';
import PropTypes from 'prop-types';
import * as Sentry from "@sentry/react";
import CriticalError from './CriticalError'

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidCatch(error, info) {
        console.warn(error);
        console.warn(info);
    }

    render() {
        const { children, errorProps } = this.props;

        return <Sentry.ErrorBoundary fallback={() => <CriticalError {...errorProps}/>}>{children}</Sentry.ErrorBoundary>;
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