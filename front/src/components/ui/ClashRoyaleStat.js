import React from 'react'

export default class ClashRoyaleStat extends React.Component {
    render () {
        let value = isNaN(this.props.value) ? this.props.value : Number(this.props.value).toLocaleString('en-us');
        return (
            <div className="col-6 col-md-3 col-lg-2 clan_stats">
                <div className="content" style={{backgroundImage: "url(" + this.props.image + ")"}}>
                    <div className="title">{this.props.title && this.props.title}</div>
                    <div className="value">{value}</div>
                </div>
            </div>
        );
    }
}