import React from 'react'
import { Redirect, Route, Switch } from "react-router-dom"
import ClanApp from "./clan/ClanApp";
import TopBar from "./ui/TopBar";
import TournamentsApp from "./tournaments/TournamentApp";
import "../style/app.css"
import { handleErrors } from "../helpers/api";
import PlayerApp from "./player/PlayerApp";
import CriticalError from "./errors/CriticalError";

export default class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            user: null,
            defaultUrl: '',
            error: null,
            mainClan: null,
        }
    }

    componentDidMount() {
        if (this.props.match === '/') {
            fetch('/api/home')
                .then(res => handleErrors(res))
                .then(res => this.setState({defaultUrl: res.url, mainClan: res.main_clan}))
                .catch(error => console.log(error));
        }
    }

    render() {
        if (this.state.error) return <CriticalError message={this.state.error.message} code={this.state.error.status}/>;
        return (
            <div>
                <TopBar user={this.state.user} />
                <div className='app-body'>
                    <main className='main'>
                        <div className='container-fluid mt-3'>
                            <Switch>
                                {this.state.defaultUrl && <Route exact path='/' component={() => <Redirect replace to={this.state.defaultUrl} />} />}
                                <Route path='/clan' render={(props) => <ClanApp {...props} mainClan={this.state.mainClan} />} />
                                <Route path='/player' component={PlayerApp} />
                                <Route path='/tournaments' component={TournamentsApp}/>
                            </Switch>
                        </div>
                    </main>
                </div>
                <footer>&nbsp;</footer>
            </div>
        )
    }
}
