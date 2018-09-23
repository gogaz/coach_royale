import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons';

import App from "./components/App"
import "react-table/react-table.css";

library.add(fas);

let moment = require("moment");
let momentDurationFormatSetup = require("moment-duration-format");
momentDurationFormatSetup(moment);

ReactDOM.render(
    <Router>
        <Switch>
            <Route path='/' component={App} />;
        </Switch>
    </Router>,
    document.getElementById("root")
);
