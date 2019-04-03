import React from 'react'
import PropTypes from 'prop-types'
import { locale } from "../../helpers/browser";
import {FontAwesomeIcon} from "./FontAwesome";

export default class ClashRoyaleStat extends React.Component {
    render () {
        let {value, title, localeString, compareTo} = this.props;
        if (localeString)
            value = isNaN(value) ? value : Number(value).toLocaleString(localeString);

        let compare_result = undefined;
        if (value && !isNaN(value) && compareTo) {
            const result = value - compareTo;
            let icon_props = result === 0 ? {icon: 'equals', color: 'muted'} : result > 0 ? {icon: 'arrow-up', color: 'success'} : {icon: 'fa-arrow-down', color: 'danger'};
            let compare_icon = <FontAwesomeIcon {...icon_props}/>;
            compare_result = result === 0 ? compare_icon : <span> ({compare_icon} {result})</span>;
        }

        return (
            <div className="col-6 col-md-3 col-lg-2 clan_stats">
                <div className="content" style={{backgroundImage: "url(" + this.props.image + ")", ...this.props.style}}>
                    <div className="title">{title && title}</div>
                    <div className="value"> {value} {compare_result && compare_result}</div>
                </div>
            </div>
        );
    }
}
ClashRoyaleStat.propTypes = {
    value: PropTypes.oneOfType([PropTypes.node, PropTypes.number]).isRequired,
    title: PropTypes.node,
    localeString: PropTypes.string,
    compareTo: PropTypes.number
};
ClashRoyaleStat.defaultProps = {localeString: locale};