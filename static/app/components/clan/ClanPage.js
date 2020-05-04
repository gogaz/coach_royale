import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import ClanDetails from "./ClanDetails";
import ClanWarMembers from "./tables/ClanWarMembers";
import ClanMembersTable from "./tables/ClanMembersTable";
import ClanSeasons from "./ClanSeasons";
import ErrorBoundary from "../errors/ErrorBoundary";
import { Card } from "../ui/Card";
import { TabsContainer, Tab, TabLink } from "../ui/Tabs";
import Separator from "../ui/Separator";

const ClanPage = ({ match }) => {
    const endPoint = `/api/clan/${ match.params.tag }`;

    return (
        <Card>
            <ErrorBoundary>
                <ClanDetails tag={ match.params.tag }/>
            </ErrorBoundary>
            <ErrorBoundary>
                <TabsContainer>
                    <Tab>
                        <TabLink to={ `${ match.url }/members` }>Clan members</TabLink>
                    </Tab>
                    <Tab>
                        <TabLink to={ `${ match.url }/wars` }>War log</TabLink>
                    </Tab>
                    <Tab>
                        <TabLink to={ `${ match.url }/seasons` }>Seasons</TabLink>
                    </Tab>
                </TabsContainer>
            </ErrorBoundary>
            <Separator />
            <ErrorBoundary>
                <Switch>
                    <Route exact path={ `${ match.url }` } render={ () => <Redirect replace to={ `${ match.url }/members` }/> }/>
                    <Route
                        path={ `${ match.url }/members` }
                        render={ (props) => <ClanMembersTable { ...props } endpoint={ endPoint + '/members' } /> }
                    />
                    <Route path={ `${ match.url }/wars` } render={ (props) => <ClanWarMembers { ...props } endpoint={ endPoint }/> }/>
                    <Route path={ `${ match.url }/seasons` } render={ (props) => <ClanSeasons { ...props } endpoint={ endPoint }/> }/>
                </Switch>
            </ErrorBoundary>
        </Card>
    );
};

export default ClanPage;