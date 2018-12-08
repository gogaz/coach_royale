import React from 'react'
import { locale } from "../../helpers/browser";

export default class ClashRoyaleStat extends React.Component {
    render () {
        let {value, title, localeString} = this.props;
        if (localeString)
            value = isNaN(value) ? value : Number(value).toLocaleString(localeString);

        return (
            <div className="col-6 col-md-3 col-lg-2 clan_stats">
                <div className="content" style={{backgroundImage: "url(" + this.props.image + ")", ...this.props.style}}>
                    <div className="title">{title && title}</div>
                    <div className="value"> {value} </div>
                </div>
            </div>
        );
    }
}
ClashRoyaleStat.defaultProps = {localeString: locale};