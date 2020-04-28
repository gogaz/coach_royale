import React, { useState } from 'react'
import moment from "moment";
import styled from "styled-components";

import { Card, Header } from "../ui/Card";
import { Flex, FlexWrapper, Grid } from "../ui/Disposition";
import ClanMembersTable from "./ClanMembersTable";
import TrophiesCell from "./cells/TrophiesCell";
import ErrorBoundary from "../errors/ErrorBoundary";

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
                        baseColumns={ ['name', 'trophies', 'given'] }
                        defaultSorted={ [{ id: "given", desc: true }] }
                        showPagination={ true }
                    />
                </ErrorBoundary>
            </Card>
            <Card style={ { marginTop: '.5rem', height: '100%' } }>
                <Header><h4>Previous Season{ previousSeason && ` (${ previousSeason.format('MMM YYYY') })` }</h4></Header>
                <ErrorBoundary>
                    <ClanMembersTable
                        endpoint={ endpoint + '/season' }
                        baseColumns={ ['name'] }
                        columns={ [
                            {
                                Header: "Trophies",
                                accessor: "details.ending",
                                width: 90,
                                Cell: ({ _, original }) => <TrophiesCell trophies={ original.details.ending } arena={ original.details.arena }/>
                            },
                            {
                                Header: "Highest",
                                accessor: "details.highest",
                                width: 90,
                                Cell: ({ _, original }) => <TrophiesCell trophies={ original.details.highest }/>
                            },
                        ] }
                        defaultSorted={ [{ id: "details.ending", desc: true }] }
                        onFetchData={ (data) => setPreviousSeason(moment(data[0].details.season__identifier + '-01', 'YYYY-MM-DD')) }
                        showPagination={ true }
                    />
                </ErrorBoundary>
            </Card>
        </Grid>
    )
};

export default ClanSeasons;