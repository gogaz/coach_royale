import React from 'react';
import PropTypes from 'prop-types';

const CriticalError = ({ code, description, message }) => (
    <div className="container">
        <div className="row justify-content-center mt-5">
            <div className="col-md-6">
                <div className="clearfix">
                    { code && <h1 className="float-left display-3 mr-4">{ code }</h1> }
                    { description && <h4 className="pt-3">{ description }</h4> }
                    { message && <p className="text-muted">{ message }</p> }
                </div>
            </div>
        </div>
    </div>
);


CriticalError.defaultProps = {
    code: 500,
    message: "Oops, something went terribly wrong!",
    description: "Internal Server Error"
};

CriticalError.propTypes = {
    code: PropTypes.node,
    message: PropTypes.node,
    description: PropTypes.node,
};

export default CriticalError;