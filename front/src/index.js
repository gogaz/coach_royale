import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Redirect, Route, Switch } from "react-router-dom";
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons';

import App from "./components/App"

library.add(fas);

ReactDOM.render(
    <Router>
        <Switch>
            <Route exact path="/" component={() => <Redirect to="/clan/2GJU92G" />}/>
            <Route path='/' component={App} />;
        </Switch>
    </Router>,
    document.getElementById("root")
);
