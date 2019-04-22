import React from "react";
import ClashRoyaleStat from "../ui/ClashRoyaleStat";
import { images } from "../../helpers/assets";
import { handleErrors } from "../../helpers/api";
import { setTitle } from "../../helpers/browser";
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
        fetch(this.props.endpoint + '/')
            .then((res) => handleErrors(res))
            .then(
                (result) => {
                    this.setState({ loading: false, clan: result });
                    setTitle(`${result.name} (${result.tag})`);
                })
            .catch(error => console.log(error) );
    }

    render() {
        let {clan, loading} = this.state;

        if (loading) return <div className="card-header"><Loading/></div>;

        let country_icon = images.region(clan.details.region_code.toLowerCase());

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
                            {clan.details.global_rank &&
                                <ClashRoyaleStat image={images.static('trophyRibbon')} title="Global rank" value={clan.details.global_rank}/>
                            }
                            {clan.details.local_rank &&
                                <ClashRoyaleStat image={images.static('trophyRibbon')} title="Local rank" value={clan.details.local_rank} compareTo={clan.details.prev_local_rank}/>
                            }
                            <ClashRoyaleStat title="Score"
                                             image={images.static('trophy')}
                                             value={clan.details.score}/>
                            {clan.details.trophies &&
                                <ClashRoyaleStat image={images.static('clanWarTrophy')} title="Trophies" value={clan.details.trophies}/>
                            }
                            <ClashRoyaleStat title="Members"
                                             image={images.static('members')}
                                             value={clan.details.member_count + " / 50"}/>
                            <ClashRoyaleStat image={country_icon} style={{backgroundSize: '2.5rem'}}
                                title="Region" value={clan.details.region} />
                            <ClashRoyaleStat image={images.static('cards')} title="Donations" value={clan.details.donations}/>
                        </div>
                    </li>
                </ul>
            </div>
        );
    }
}