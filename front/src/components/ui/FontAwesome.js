import React from 'react';
import PropTypes from 'prop-types';

class FontAwesomeIcon extends React.Component {
    render() {
        const {library, icon, spin, pulse, rotate, flip, scale} = this.props;
        let classNames = [ library, 'fa-' + icon ];
        if (spin) classNames = [ ...classNames, 'fa-spin' ];
        if (pulse) classNames = [ ...classNames, 'fa-pulse' ];
        if (rotate) classNames = [ ...classNames, 'fa-rotate-' + Number(rotate).toString() ];
        if (flip) classNames = [ ...classNames, 'fa-flip-' + flip ];
        if (scale > 1) classNames = [ ...classNames, 'fa-' + Number(scale).toString() + 'x' ];

        return <i className={classNames.join(' ')} />
    }
}

FontAwesomeIcon.defaultProps = {
    spin: false,
    pulse: false,
    rotate: 0,
    flip: false,
    scale: 1,
    library: 'fas',
};
FontAwesomeIcon.propTypes = {
    icon: PropTypes.string.isRequired,
    spin: PropTypes.bool,
    pulse: PropTypes.bool,
    rotate: PropTypes.oneOf([ 0, 90, 180, 270 ]),
    flip: PropTypes.oneOf([ false, 'vertical', 'horizontal' ]),
    scale: PropTypes.oneOf([...Array(5).keys()]),
    library: PropTypes.oneOf([ 'fa', 'fas', 'fal' ]),
    color: PropTypes.oneOf(['danger', 'success', 'warning', 'primary', 'secondary', 'info', 'muted', 'light', 'white'])
};

export { FontAwesomeIcon };