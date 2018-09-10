import React from "react"
import { Route, Switch } from "react-router-dom";

import PlayerPage from "./PlayerPage";

export default class PlayerApp extends React.Component {
    render () {
        return (<Switch>
                <Route exact path={this.props.match.url + "/"} component={ null } />
                <Route path={this.props.match.url + "/:tag"} component={ PlayerPage } />
            </Switch>)
    }
}