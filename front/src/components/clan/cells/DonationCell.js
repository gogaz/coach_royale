import React from 'react';
import { images } from "../../../helpers/assets";
import { FontAwesomeIcon } from "../../ui/FontAwesome";

export default class DonationCell extends React.Component {
    render () {
        const isPositive = (x, u, v, w) => x > 0 ? u : x === 0 ? v : w;
        const {column, row, compareTo} = this.props;
        let result = row[column];
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
                    <img src={images.cardsWar} /><span className={"text-"+color}><FontAwesomeIcon icon={icon} /></span>
                </i>
                &nbsp;{result}
            </span>
        )
    }
}