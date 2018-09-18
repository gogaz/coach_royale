import React from 'react';

export default class CriticalError extends React.Component {
    render() {
        return (
            <div className="container">
                <div className="row justify-content-center mt-5">
                    <div className="col-md-6">
                        <div className="clearfix">
                            <h1 className="float-left display-3 mr-4">{this.props.code}</h1>
                            <h4 className="pt-3">{this.props.message}</h4>
                            {this.props.description && <p className="text-muted">{this.props.description}</p>}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
CriticalError.defaultProps = {code: 500, message:"Oops, something went terribly wrong!", description: null};