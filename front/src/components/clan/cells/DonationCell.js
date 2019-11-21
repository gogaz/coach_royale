import React from 'react';
import PropTypes from 'prop-types';

import { images } from "../../../helpers/assets";
import { FontAwesomeIcon } from "../../ui/FontAwesome";

export default class DonationCell extends React.Component {
    render () {
        const isPositive = (x, u, v, w) => x > 0 ? u : x === 0 ? v : w;
        const {column, row, compareTo} = this.props;
        let result = row[column] || 0;
        let icon = this.props.icon;
        let color = this.props.color;
        if (compareTo) {
            result = row[compareTo] - row[column];
            icon = isPositive(result, 'arrow-up', 'equals', 'arrow-down');
            color = isPositive(result, 'success', 'primary', 'danger');
        }
        return (
            <span>
                <i className="donations-icons">
                    <img src={images.static('cardsWar')} alt="Donations"/>
                    <span className={"text-"+color}><FontAwesomeIcon icon={icon} /></span>
                </i>
                &nbsp;{result}
            </span>
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