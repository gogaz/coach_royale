import React from 'react'
import PropTypes from 'prop-types'
import styled, {withTheme} from "styled-components"

import { locale } from "../../helpers/browser";
import {FontAwesomeIcon} from "./FontAwesome";

const CardContent = styled.div`
    background: url("${({image}) => image}") no-repeat center left;
    background-size: auto 40px;
    padding-left: 3rem;
    position: relative;
`;

const CardContentTitle = styled.div`
    font-weight: bold;
`;

const Icon = styled.span`
    position: absolute;
    bottom: 0;
    left: 1.3rem;
    font-size: 20px;
    text-shadow: -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff;
`;

class ClashRoyaleStat extends React.Component {
    render () {
        let {value, title, localeString, compareTo, compareInv, theme} = this.props;

        if (localeString)
            value = isNaN(value) ? value : Number(value).toLocaleString(localeString);

        let result = undefined;
        if (value && !isNaN(value) && !isNaN(compareTo)) {
            result = value - compareTo;
            if (compareInv)
                result = -result;
        }

        return (
            <CardContent image={this.props.image} style={this.props.style}>
                { result > 0 && (
                    <Icon><FontAwesomeIcon icon="arrow-up" color={theme.colors.green}/></Icon>
                )}
                { result < 0 && (
                    <Icon><FontAwesomeIcon icon="arrow-down" color={theme.colors.red}/></Icon>
                )}
                { result === 0 && (
                    <Icon><FontAwesomeIcon icon="equals" color={theme.colors.dark}/></Icon>
                )}
                <CardContentTitle>{title && title}</CardContentTitle>
                {value}
                { result > 0 && ` (+${result})`}
                { result < 0 && ` (${result})`}
            </CardContent>
        );
    }
}
ClashRoyaleStat.propTypes = {
    value: PropTypes.oneOfType([PropTypes.node, PropTypes.number]).isRequired,
    title: PropTypes.node,
    localeString: PropTypes.string,
    compareTo: PropTypes.any,
    compareInv: PropTypes.bool, // Invert comparison
};
ClashRoyaleStat.defaultProps = {localeString: locale, compareInv: true};

export default withTheme(ClashRoyaleStat);