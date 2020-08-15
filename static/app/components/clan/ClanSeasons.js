import React, { useState } from 'react'
import moment from 'moment'
import styled from 'styled-components'

import { Card, Header } from 'components/ui/Card'
import { Flex, Grid } from 'components/ui/Disposition'
import ClanMembersTable from './tables/ClanMembersTable'
import ErrorBoundary from '../errors/ErrorBoundary'

const Data = styled(Flex)`
    margin-top: .5rem;
    height: 100%;
`;

const ClanSeasons = ({ endpoint }) => {
    const [previousSeason, setPreviousSeason] = useState(null);

    return (
        <Grid columns={ { sm: 1, md: 2 } } style={ { padding: '1.25rem' } } gap="20px">
            <Card style={ { marginTop: '.5rem', height: '100%' } }>
                <Header><h4>Previous week</h4></Header>
                <ErrorBoundary>
                    <ClanMembersTable
                        endpoint={ endpoint + '/weekly' }
                        columns={ ['name', 'trophies', 'received', 'given', 'total'] }
                        defaultSorted={ [{ id: "donated", desc: true }] }
                        showPagination
                    />
                </ErrorBoundary>
            </Card>
            <Card style={ { marginTop: '.5rem', height: '100%' } }>
                <Header>
                    <h4>Previous Season{ previousSeason && ` (${ previousSeason.format('MMM YYYY') })` }</h4>
                </Header>
                <ErrorBoundary>
                    <ClanMembersTable
                        endpoint={ endpoint + '/season' }
                        columns={ ['name', 'ending', 'highest'] }
                        defaultSorted={ [{ id: "ending", desc: true }] }
                        onFetchData={ (data) => !!data.length && setPreviousSeason(moment(data[0].details.season__identifier + '-01', 'YYYY-MM-DD')) }
                        showPagination
                    />
                </ErrorBoundary>
            </Card>
        </Grid>
    )
};

export default ClanSeasons;