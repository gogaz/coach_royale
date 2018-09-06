import React from "react";
import ReactTooltip from 'react-tooltip'
import moment from "moment";
import ClashRoyaleStat from "../ui/ClashRoyaleStat";
import { images } from "../../style/assets";

export default class ClanDetails extends React.Component {
    render() {
        let lookup = require('country-data').lookup;

        let country_icon = lookup.countries({name: this.props.clan.details.region})[0].alpha2.toLowerCase();
        country_icon = "https://raw.githubusercontent.com/hjnilsson/country-flags/master/png100px/" + country_icon + '.png';
        let last_refresh = moment(this.props.clan.last_refresh);
        return (
            <div>
                <div className="card-header">
                    <div className="row">
                        <div className="col-9">
                            <h3>{ this.props.clan.name }</h3>
                            <span className="d-block">{this.props.clan.details.description}</span>
                            <small>
                                <span className="text-muted text-uppercase" data-tip="last refreshed">
                                    Last refresh { last_refresh.fromNow() }
                                </span>
                                <ReactTooltip place="bottom" type="dark" effect="solid">
                                    { last_refresh.format('L') + ' ' + last_refresh.format('LTS') }
                                </ReactTooltip>
                            </small>
                        </div>
                        <div className="col-3">
                            <img src={ this.props.clan.details.badge }
                                 style={ { float: 'right', height: '5pc' } } />
                        </div>
                    </div>
                </div>
                <ul className="list-group">
                    <li className="list-group-item">
                        <div className="row mt-2">
                            <ClashRoyaleStat title="Score"
                                             image={images.trophyRibbon}
                                             value={Number(this.props.clan.details.score).toLocaleString('en-us')}/>
                            <ClashRoyaleStat title="Members"
                                             image={images.socialAlt}
                                             value={this.props.clan.details.member_count}/>
                            <ClashRoyaleStat image={country_icon}
                                title="Region" value={this.props.clan.details.region} />
                            <ClashRoyaleStat image={images.donations} title="Donations" value={this.props.clan.details.donations}/>
                        </div>
                    </li>
                </ul>
            </div>
        );
    }
}