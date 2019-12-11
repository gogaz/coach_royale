import React from "react";
import styled from 'styled-components'

import {handleErrors} from "../../helpers/api";

import ClashRoyaleStat from "../ui/ClashRoyaleStat";
import {images} from "../../helpers/assets";
import {setTitle} from "../../helpers/browser";
import Loading from "../ui/Loading";
import LastRefreshInfo from "../ui/LastRefreshInfo";

const CardContainer = styled.div`
    margin-top: .75rem;
    margin-left: 1.25rem;
    margin-bottom: .5rem;
    display: grid;
    row-gap: 10px;
    
    @media (max-width: 425px) {
        grid-template-columns: repeat(2, 1fr);
    }
    @media (min-width: 425px) {
        grid-template-columns: repeat(3, 1fr);
    }
    @media (min-width: 750px) {
        grid-template-columns: repeat(5, 1fr);
    }
    @media (min-width: 1170px) {
        grid-template-columns: repeat(8, minmax(125px, 1fr));
    }
`;

export default class ClanDetails extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            clan: {details: {}},
            error: {}
        }
    }

    componentDidMount() {
        setTitle("Clan overview");
        fetch(this.props.endpoint + '/')
            .then((res) => handleErrors(res))
            .then(
                (result) => {
                    this.setState({loading: false, clan: result});
                    setTitle(`${result.name} (#${result.tag})`);
                })
            .catch(error => console.log(error));
    }

    render() {
        const {clan, loading} = this.state;

        if (loading) return <div className="card-header"><Loading/></div>;

        const country_icon = images.region(clan.details.region_code.toLowerCase());

        return (
            <React.Fragment>
                <div className="card-header">
                    <div className="row">
                        <div className="col-9">
                            <h3 className="d-inline mr-2">{clan.name}</h3><LastRefreshInfo
                            time={clan.details.last_refresh}/>
                            <span className="d-block">{clan.details.description}</span>
                        </div>
                        <div className="col-3">
                            <img src={clan.details.badge}
                                 style={{float: 'right', height: '52px'}}/>
                        </div>
                    </div>
                </div>
                <CardContainer>
                    {clan.details.global_rank &&
                    <ClashRoyaleStat
                        image={images.static('trophyRibbon')}
                        title="Global"
                        value={clan.details.global_rank}
                    />
                    }
                    {clan.details.local_rank &&
                    <ClashRoyaleStat
                        image={images.static('trophyRibbon')}
                        title={clan.details.region}
                        value={clan.details.local_rank}
                        compareTo={clan.details.prev_local_rank}
                    />
                    }
                    {clan.details.global_war_rank &&
                    <ClashRoyaleStat
                        image={images.static('clanWarTrophy')}
                        title="Global"
                        value={clan.details.global_war_rank}
                    />
                    }
                    {clan.details.local_war_rank &&
                    <ClashRoyaleStat
                        image={images.static('clanWarTrophy')}
                        title={clan.details.region}
                        value={clan.details.local_war_rank}
                        compareTo={clan.details.prev_local_rank}
                    />
                    }
                    <ClashRoyaleStat
                        title="Score"
                        image={images.static('trophy')}
                        value={clan.details.score}
                    />
                    {clan.details.trophies &&
                    <ClashRoyaleStat
                        image={images.static('clanWarTrophy')}
                        title="Trophies"
                        value={clan.details.trophies}
                    />
                    }
                    <ClashRoyaleStat
                        title="Members"
                        image={images.static('members')}
                        value={clan.details.member_count + " / 50"}
                    />
                    <ClashRoyaleStat
                        image={country_icon} style={{paddingLeft: '4.5rem'}}
                        title="Region"
                        value={clan.details.region}
                    />
                    <ClashRoyaleStat
                        image={images.static('cards')}
                        title="Donations"
                        value={clan.details.donations}
                    />
                </CardContainer>
            </React.Fragment>
        );
    }
}