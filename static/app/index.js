import "regenerator-runtime/runtime";

import React from "react";
import ReactDOM from "react-dom";

import "react-table/react-table.css";
import "react-datepicker/dist/react-datepicker.css";
import "./style/app.css"

import { locale } from "./helpers/browser";
import App from "./components/App";
import { ThemeProvider } from "styled-components";
import { defaultTheme } from "./style/theme";
import { BrowserRouter as Router } from "react-router-dom";
import { ConstantsProvider, loadConstants } from "./helpers/constants";

const moment = require("moment-shortformat");
const momentDurationFormatSetup = require("moment-duration-format");
momentDurationFormatSetup(moment);
moment.locale(locale);
const constants = loadConstants();


ReactDOM.render((
        <ThemeProvider theme={ defaultTheme }>
            <ConstantsProvider value={ constants }>
                <Router>
                    <App/>
                </Router>
            </ConstantsProvider>
        </ThemeProvider>
    ),
    document.getElementById("root"));
