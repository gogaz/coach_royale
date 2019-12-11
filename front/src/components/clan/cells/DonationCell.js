import React from 'react';
import PropTypes from 'prop-types';
import styled, {withTheme} from "styled-components";

import { images } from "../../../helpers/assets";
import { FontAwesomeIcon } from "../../ui/FontAwesome";

const Image = styled.img`
    vertical-align: top;
    height: 1.2rem;
`;

const ImageWrapper = styled.i`
    line-height: 1;
    vertical-align: middle;
    display: inline-block;
    position: relative;
    
    i.fa, i.fas, i.fal, i.far {
        position: absolute;
        margin: 0;
        top: auto;
        left: auto;
        right: 0;
        bottom: 0;
        -webkit-transform: none;
        transform: none;
        font-size: .8em;
        text-shadow: -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff;
    }
`;

class DonationCell extends React.Component {
    render () {
        const minAvgMax = (x, u, v, w) => x > 0 ? u : x === 0 ? v : w;
        const {theme, column, row, compareTo} = this.props;

        let result = row[column] || 0;
        let icon = this.props.icon;
        let color = this.props.color;

        if (compareTo) {
            result = row[compareTo] - row[column];
            icon = minAvgMax(result, 'arrow-up', 'equals', 'arrow-down');
            color = minAvgMax(result, theme.colors.green, theme.colors.blue, theme.colors.orange);
        }

        return (
            <React.Fragment>
                <ImageWrapper>
                    <Image src={images.static('cardsWar')} alt="Donations"/>
                    <FontAwesomeIcon icon={icon} color={color}/>
                </ImageWrapper>
                &nbsp;{result}
            </React.Fragment>
        )
    }
}
DonationCell.defaultProps = {
    compareTo: '',
    color: 'primary',
};
DonationCell.propTypes = {
    column: PropTypes.string.isRequired,
    row: PropTypes.oneOfType([PropTypes.object, PropTypes.array]).isRequired,
    compareTo: PropTypes.string,
    color: PropTypes.string,
    icon: PropTypes.string,
};

export default withTheme(DonationCell)