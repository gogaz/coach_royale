import React from 'react';
import PropTypes from 'prop-types';
import styled, { withTheme } from 'styled-components'

import { images } from 'helpers/assets'
import FontAwesomeIcon from 'components/ui/FontAwesome'

const Image = styled.img`
    vertical-align: top;
    height: 1.2rem;
`;

const ImageWrapper = styled.i`
    line-height: 1;
    vertical-align: middle;
    display: inline-block;
    position: relative;
`;

const minAvgMax = (x, u, v, w) => x > 0 ? u : x === 0 ? v : w;

const DonationCell = ({ theme, column, row, compareTo, icon, color }) => {
    let result = row[column] || 0;

    if (compareTo) {
        result = row[compareTo] - row[column];
        if (!icon) icon = minAvgMax(result, 'arrow-up', 'equals', 'arrow-down');
        if (!color) color = minAvgMax(result, theme.colors.green, theme.colors.blue, theme.colors.red);
    }

    const iconStyle = {
        position: "absolute",
        margin: 0,
        top: "auto",
        left: "auto",
        right: 0,
        bottom: 0,
        transform: "none",
        fontSize: ".8em",
        textShadow: "-1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff",
    };

    return (
        <React.Fragment>
            { result }
            &nbsp;
            <ImageWrapper>
                <Image src={ images.static('cardsWar') } alt="Donations"/>
                <FontAwesomeIcon icon={ icon } color={ color || theme.colors.blue } style={ iconStyle }/>
            </ImageWrapper>
        </React.Fragment>
    )
};
DonationCell.defaultProps = {
    compareTo: '',
};
DonationCell.propTypes = {
    column: PropTypes.string.isRequired,
    row: PropTypes.oneOfType([PropTypes.object, PropTypes.array]).isRequired,
    compareTo: PropTypes.string,
    color: PropTypes.string,
    icon: PropTypes.string,
};

export default withTheme(DonationCell)