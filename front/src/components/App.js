import React from "react";
import {defaultTheme} from "../style/theme";
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import {ThemeProvider} from "styled-components";
import Layout from "./Layout";

export default class App extends React.Component {
    render() {
        return (
            <ThemeProvider theme={defaultTheme}>
                <Router>
                    <Switch>
                        <Route path='/' component={Layout}/>;
                    </Switch>
                </Router>
            </ThemeProvider>
        );
    }
}
