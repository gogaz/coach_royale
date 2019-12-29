import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { NavTab } from 'react-router-tabs';
import ClanDetails from "./ClanDetails";
import ClanWarMembers from "./ClanWarMembers";
import ClanMembersTable from "./ClanMembersTable";
import ClanSeasons from "./ClanSeasons";
import ErrorBoundary from "../errors/ErrorBoundary";
import { Card } from "../ui/Card";

const ClanPage = ({ match }) => {
    const endPoint = `/api/clan/${ match.params.tag }`;

    return (
        <Card>
            <ErrorBoundary>
                <ClanDetails endpoint={ endPoint }/>
            </ErrorBoundary>
            <ErrorBoundary>
                <ul className="nav nav-tabs">
                    <li className="nav-item">
                        <NavTab to={ `${ match.url }/members` } className="nav-link">Clan members</NavTab>
                    </li>
                    <li className="nav-item">
                        <NavTab to={ `${ match.url }/wars` } className="nav-link">War log</NavTab>
                    </li>
                    <li className="nav-item">
                        <NavTab to={ `${ match.url }/seasons` } className="nav-link">Seasons</NavTab>
                    </li>
                </ul>
            </ErrorBoundary>
            <ErrorBoundary>
                <Switch>
                    <Route exact path={ `${ match.url }` } render={ () => <Redirect replace to={ `${ match.url }/members` }/> }/>
                    <Route
                        path={ `${ match.url }/members` }
                        render={ (props) => <ClanMembersTable { ...props } endpoint={ endPoint + '/members' } pageSize={ 50 }/> }
                    />
                    <Route path={ `${ match.url }/wars` } render={ (props) => <ClanWarMembers { ...props } endpoint={ endPoint }/> }/>
                    <Route path={ `${ match.url }/seasons` } render={ (props) => <ClanSeasons { ...props } endpoint={ endPoint }/> }/>
                </Switch>
            </ErrorBoundary>
        </Card>
    );
};

export default ClanPage;