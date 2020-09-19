import React from 'react';
import PropTypes from 'prop-types';
import styled, { withTheme } from 'styled-components'

const StyledIcon = styled.i`
    display: flex;
    align-items: center;
    font-size: ${({ size }) => size}
`

const FontAwesomeIcon = ({ theme, library, icon, spin, pulse, rotate, flip, scale, color, style, size }) => {
    let classNames = [library, 'fa-' + icon];
    if (spin) classNames = [...classNames, 'fa-spin'];
    if (pulse) classNames = [...classNames, 'fa-pulse'];
    if (rotate) classNames = [...classNames, 'fa-rotate-' + Number(rotate).toString()];
    if (flip) classNames = [...classNames, 'fa-flip-' + flip];
    if (scale > 1) classNames = [...classNames, 'fa-' + Number(scale).toString() + 'x'];

    const iconProps = {
        style: {
            color: color || theme.colors.black,
            marginRight: '3px',
            marginLeft: '3px',
            ...style
        }
    };

    return <StyledIcon className={ classNames.join(' ') } { ...iconProps } size={size} />
};

FontAwesomeIcon.defaultProps = {
    spin: false,
    pulse: false,
    rotate: 0,
    flip: false,
    scale: 1,
    library: 'fas',
    size: '1rem',
};
FontAwesomeIcon.propTypes = {
    icon: PropTypes.string.isRequired,
    spin: PropTypes.bool,
    pulse: PropTypes.bool,
    rotate: PropTypes.oneOf([0, 90, 180, 270]),
    flip: PropTypes.oneOf([false, 'vertical', 'horizontal']),
    scale: PropTypes.oneOf([...Array(5).keys()]),
    library: PropTypes.oneOf(['fa', 'fas', 'fal']),
    color: PropTypes.string,
    style: PropTypes.object,
};

export default withTheme(FontAwesomeIcon);
