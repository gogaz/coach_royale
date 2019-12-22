import React from "react";
import ReactDOM from "react-dom";

import "react-table/react-table.css";
import "react-datepicker/dist/react-datepicker.css";
import "./style/app.css"

import {locale} from "./helpers/browser";
import App from "./components/App";

let moment = require("moment-shortformat");
let momentDurationFormatSetup = require("moment-duration-format");
momentDurationFormatSetup(moment);
moment.locale(locale);

ReactDOM.render(<App/>, document.getElementById("root"));
