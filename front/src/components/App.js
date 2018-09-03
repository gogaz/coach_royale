import React from 'react'
import { Switch, Link, Route } from "react-router-dom"
import ClanApp from "./clan/ClanApp";
import TopBar from "./ui/TopBar";

import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'

import "../style/app.css"

library.add(fas);

export default class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            user: null,
        }
    }

    render() {
        return (
            <div>
                <TopBar user={this.state.user} />
                <div className="app-body">
                    <main className="main">
                        <div className="container-fluid mt-3">
                            <Switch>
                                <Route path='/clan' component={ ClanApp } />
                                <Route path='/player' component={ null } />
                            </Switch>
                        </div>
                    </main>
                </div>
                <footer>&nbsp;</footer>
            </div>
        )
    }
}