import React from "react"
import { Route, Switch } from "react-router-dom";

import PlayerPage from "./PlayerPage";

const PlayerApp = ({ match }) => (
    <Switch>
        <Route exact path={ match.url + "/" } component={ null }/>
        <Route path={ match.url + "/:tag" } component={ PlayerPage }/>
    </Switch>
);

export default PlayerApp;