import "regenerator-runtime/runtime";

import React from 'react'
import ReactDOM from 'react-dom'
import { ThemeProvider } from 'styled-components'
import "react-datepicker/dist/react-datepicker.css";

import App from 'components/App'
import { defaultTheme } from 'style/theme'
import { BrowserRouter as Router } from 'react-router-dom'
import initSentry from 'utils/sentry'

initSentry();

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
