import React from 'react';
import CriticalError from "./CriticalError";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        hasError: false,
        error: '',
        errorInfo: '',
    };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    this.setState({
        hasError: true,
        error: error,
        errorInfo: errorInfo,
    })
  }

  render() {
    if (this.state.hasError) {
      return <CriticalError code='' description={this.state.error} message={this.state.errorInfo}/>;
    }

    return this.props.children;
  }
}