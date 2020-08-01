import "regenerator-runtime/runtime";

import React from 'react'
import ReactDOM from 'react-dom'
import { ThemeProvider } from 'styled-components'
import moment from 'moment'
import "react-datepicker/dist/react-datepicker.css";

import { locale } from 'helpers/browser'
import App from 'components/App'
import { defaultTheme } from 'style/theme'
import { BrowserRouter as Router } from 'react-router-dom'


const momentDurationFormatSetup = require("moment-duration-format");
momentDurationFormatSetup(moment);
moment.locale(locale);

ReactDOM.render(
    (
        <ThemeProvider theme={ defaultTheme }>
            <Router>
                <App/>
            </Router>
        </ThemeProvider>
    ),
    document.getElementById("root")
);
