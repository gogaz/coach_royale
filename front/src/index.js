import React from "react";
import ReactDOM from "react-dom";
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import {ThemeProvider} from "styled-components";

import "react-table/react-table.css";
import "react-datepicker/dist/react-datepicker.css";

import {locale} from "./helpers/browser";
import {defaultTheme} from './style/theme';
import App from "./components/App";

let moment = require("moment-shortformat");
let momentDurationFormatSetup = require("moment-duration-format");
momentDurationFormatSetup(moment);
moment.locale(locale);

ReactDOM.render(
    <ThemeProvider theme={defaultTheme}>
        <Router>
            <Switch>
                <Route path='/' component={App} />;
            </Switch>
        </Router>
    </ThemeProvider>,
    document.getElementById("root")
);
