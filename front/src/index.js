import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { locale } from "./helpers/browser";
import App from "./components/App"
import "react-table/react-table.css";

let moment = require("moment-shortformat");
let momentDurationFormatSetup = require("moment-duration-format");
momentDurationFormatSetup(moment);
moment.locale(locale);

ReactDOM.render(
    <Router>
        <Switch>
            <Route path='/' component={App} />;
        </Switch>
    </Router>,
    document.getElementById("root")
);
