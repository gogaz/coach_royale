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
    console.log(error);
    console.log(errorInfo);
    this.setState({
        hasError: true,
        error: error,
        errorInfo: errorInfo,
    })
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <CriticalError code='' description={this.state.error} message={this.state.errorInfo}/>;
    }

    return this.props.children;
  }
}