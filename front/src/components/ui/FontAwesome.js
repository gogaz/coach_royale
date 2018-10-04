import React from 'react';

class FontAwesomeIcon extends React.Component {
    render() {
        const {library, icon, spin, pulse, rotate, flip, scale} = this.props;
        let classNames = [library, 'fa-' + icon];
        if (spin) classNames = [...classNames, 'fa-spin'];
        if (pulse) classNames = [...classNames, 'fa-pulse'];
        // rotate = 0 | 90 | 180 | 270
        if (rotate) classNames = [...classNames, 'fa-rotate-'+Number(rotate).toString()];
        // flip = 'vertical' | 'horizontal'
        if (flip) classNames = [...classNames, 'fa-flip-' + flip];
        if (scale > 1) classNames = [...classNames, 'fa-' + Number(scale).toString() + 'x']

        return <i className={classNames.join(' ')}></i>
    }
}
FontAwesomeIcon.defaultProps = {
    spin: false,
    pulse: false,
    rotate: 0,
    flip: null,
    scale: 1,
    library: 'fas'
};

export { FontAwesomeIcon };