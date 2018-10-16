import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { NavTab } from 'react-router-tabs';
import ClanDetails from "./ClanDetails";
import ClanMembers from "./ClanMembers";
import ClanWarMembers from "./ClanWarMembers";

export default class ClanPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            endPoint: "/api/clan/" + props.match.params.tag,
        }
    }
    render() {
        const {match} = this.props;

        return (
            <div className="card">
                <ClanDetails endpoint={this.state.endPoint} />
                <ul className="nav nav-tabs">
                    <li className="nav-item">
                        <NavTab to={`${match.url}/members`} className="nav-link">Clan members</NavTab>
                    </li>
                    <li className="nav-item">
                        <NavTab to={`${match.url}/wars`} className="nav-link">War log</NavTab>
                    </li>
                </ul>

                <Switch>
                    <Route exact path={`${match.url}`} render={() => <Redirect replace to={`${match.url}/members`} />} />
                    <Route path={`${match.url}/members`} render={(props) => <ClanMembers {...props} endpoint={this.state.endPoint} />} />
                    <Route path={`${match.url}/wars`} render={(props) => <ClanWarMembers {...props} endpoint={this.state.endPoint} />} />
                </Switch>
            </div>
        );
    }
}