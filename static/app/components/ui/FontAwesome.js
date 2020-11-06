import React from 'react';
import PropTypes from 'prop-types';
import styled, { withTheme } from 'styled-components'

const IconWrapper = styled.span`
    display: inline-block;
`
const StyledIcon = styled.i`
    display: flex;
    align-items: center;
    font-size: ${({ size }) => size}
`

const FontAwesomeIcon = ({ theme, library, icon, spin, pulse, rotate, flip, color, style, size, ...props }) => {
    let classNames = [library, 'fa-' + icon];
    if (spin) classNames = [...classNames, 'fa-spin'];
    if (pulse) classNames = [...classNames, 'fa-pulse'];
    if (rotate) classNames = [...classNames, 'fa-rotate-' + Number(rotate).toString()];
    if (flip) classNames = [...classNames, 'fa-flip-' + flip];

    const iconProps = {
        style: {
            color: color || theme.colors.black,
            marginRight: '3px',
            marginLeft: '3px',
            ...style
        },
        ...props
    };

    return <IconWrapper><StyledIcon className={ classNames.join(' ') } { ...iconProps } size={size} /></IconWrapper>
};

FontAwesomeIcon.defaultProps = {
    spin: false,
    pulse: false,
    rotate: 0,
    flip: false,
    library: 'fas',
    size: '1rem',
};
FontAwesomeIcon.propTypes = {
    icon: PropTypes.string.isRequired,
    spin: PropTypes.bool,
    pulse: PropTypes.bool,
    rotate: PropTypes.oneOf([0, 90, 180, 270]),
    flip: PropTypes.oneOf([false, 'vertical', 'horizontal']),
    library: PropTypes.oneOf(['fa', 'fas', 'fal']),
    color: PropTypes.string,
    style: PropTypes.object,
};

export default withTheme(FontAwesomeIcon);
