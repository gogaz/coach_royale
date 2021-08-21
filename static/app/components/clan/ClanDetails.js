import React from 'react'
import styled, { withTheme } from 'styled-components'

import { setTitle } from 'utils/browser'
import { useAutoFetch } from 'hooks/useAxios'
import { images } from 'utils/assets'

import { Flex, FlexWrapper, Grid } from 'components/ui/Disposition'
import Loading from 'components/ui/Loading'
import ClashRoyaleStat from 'components/ui/ClashRoyaleStat'
import LastRefreshInfo from 'components/ui/LastRefreshInfo'
import { Header } from 'components/ui/Card'

const CardContainer = styled(Grid)`
    margin-top: .75rem;
    margin-left: 1.25rem;
    margin-bottom: .5rem;
    row-gap: 10px;
`;

const ClanDetails = ({ tag }) => {
    const { response: data, loading } = useAutoFetch(
        `/api/clan/${tag}/`,
        {},
        (result) => setTitle(`${ result.name } (#${ result.tag })`)
    );

    if (loading) return <Header><Loading/></Header>;

    const country_icon = images.region(data.details.region_code.toLowerCase());

    return (
        <div data-testid='clan details'>
            <Header>
                <FlexWrapper direction="row">
                    <Flex grow={9}>
                        <h3 className="d-inline mr-2">{ data.name }</h3>
                        <LastRefreshInfo time={ data.details.last_refresh }/>
                        <span className="d-block">{ data.details.description }</span>
                    </Flex>
                    <Flex grow={3}>
                        <img src={ data.details.badge }
                             style={ { float: 'right', height: '52px' } }/>
                    </Flex>
                </FlexWrapper>
            </Header>
            <CardContainer columns={ { xs: 2, sm: 3, md: 5, lg: 8 } }>
                { data.details.global_rank &&
                    <ClashRoyaleStat
                        image={ images.static('trophyRibbon') }
                        title="Global"
                        value={ data.details.global_rank }
                    />
                }
                { data.details.local_rank &&
                    <ClashRoyaleStat
                        image={ images.static('trophyRibbon') }
                        title={ data.details.region }
                        value={ data.details.local_rank }
                        compareTo={ data.details.prev_local_rank }
                    />
                }
                { data.details.global_war_rank &&
                    <ClashRoyaleStat
                        image={ images.static('clanWarTrophy') }
                        title="Global"
                        value={ data.details.global_war_rank }
                    />
                }
                { data.details.local_war_rank &&
                    <ClashRoyaleStat
                        image={ images.static('clanWarTrophy') }
                        title={ data.details.region }
                        value={ data.details.local_war_rank }
                        compareTo={ data.details.prev_local_rank }
                    />
                }
                <ClashRoyaleStat
                    title="Score"
                    image={ images.static('trophy') }
                    value={ data.details.score }
                />
                <ClashRoyaleStat
                    image={ images.static('clanWarTrophy') }
                    title="Trophies"
                    value={ data.details.clan_war_trophies }
                />
                <ClashRoyaleStat
                    title="Members"
                    image={ images.static('members') }
                    value={ data.details.member_count + " / 50" }
                />
                <ClashRoyaleStat
                    image={ country_icon } style={ { paddingLeft: '4.5rem' } }
                    title="Region"
                    value={ data.details.region }
                />
                <ClashRoyaleStat
                    image={ images.static('cards') }
                    title="Donations"
                    value={ data.details.donations }
                />
            </CardContainer>
        </div>
    );
};

export default withTheme(ClanDetails);