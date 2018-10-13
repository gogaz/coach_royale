import React from "react";
import ClashRoyaleStat from "../ui/ClashRoyaleStat";
import { images } from "../../helpers/assets";
import { handleErrors, setTitle } from "../../helpers/api";
import Loading from "../ui/Loading";
import LastRefreshInfo from "../ui/LastRefreshInfo";

export default class ClanDetails extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            clan: {details:{}},
            error: {}
        }
    }

    componentDidMount() {
        setTitle("Clan overview");
        fetch(this.props.endpoint)
            .then((res) => handleErrors(res))
            .then(
                (result) => {
                    console.log(result);
                    this.setState({ loading: false, clan: result });
                    setTitle(`${result.name} (${result.tag})`);
                })
            .catch(error => console.log(error) );
    }

    render() {
        let {clan, loading} = this.state;

        if (loading) return <div className="card-header"><Loading/></div>;

        let lookup = require('country-data').lookup;
        let region = lookup.countries({name: clan.details.region})[0].alpha2.toLowerCase();
        let country_icon = images.regionIcon(region);

        return (
            <div>
                <div className="card-header">
                    <div className="row">
                        <div className="col-9">
                            <h3 className="d-inline mr-2">{ clan.name }</h3><LastRefreshInfo time={clan.details.last_refresh}/>
                            <span className="d-block">{clan.details.description}</span>
                        </div>
                        <div className="col-3">
                            <img src={ clan.details.badge }
                                 style={ { float: 'right', height: '52px' } } />
                        </div>
                    </div>
                </div>
                <ul className="list-group">
                    <li className="list-group-item">
                        <div className="row mt-2">
                            <ClashRoyaleStat title="Score"
                                             image={images.trophyRibbon}
                                             value={clan.details.score}/>
                            {clan.war.total_trophies &&
                                <ClashRoyaleStat image={images.clanWarTrophy} title="Trophies" value={clan.war.total_trophies}/>
                            }
                            <ClashRoyaleStat title="Members"
                                             image={images.members}
                                             value={clan.details.member_count + " / 50"}/>
                            <ClashRoyaleStat image={country_icon}
                                title="Region" value={clan.details.region} />
                            <ClashRoyaleStat image={images.cards} title="Donations" value={clan.details.donations}/>
                        </div>
                    </li>
                </ul>
            </div>
        );
    }
}