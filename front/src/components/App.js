import React from 'react'
import { Redirect, Route, Switch } from "react-router-dom"
import ClanApp from "./clan/ClanApp";
import TopBar from "./ui/TopBar";
import "../style/app.css"
import { handleErrors } from "../helpers/api";
import { ConstantsContext, loadConstants } from "../helpers/constants";
import PlayerApp from "./player/PlayerApp";
import CriticalError from "./errors/CriticalError";
import Loading from "./ui/Loading";

export default class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            user: null,
            defaultUrl: '',
            error: null,
            mainClan: null,
            loadingHome: true,
            loadingConstants: true,
            constants: {},
        }
    }

    componentDidMount() {
        if (this.props.match.path === '/') {
            fetch('/api/home')
                .then(res => handleErrors(res))
                .then(res => this.setState({
                    defaultUrl: res.url,
                    mainClan: res.main_clan,
                    loadingHome: false,
                }))
                .catch(error => console.log(error));
        }
        loadConstants().then((results) => {
            this.setState({
                loadingConstants: false,
                constants: {
                    arenas: results[0]
                }
            });
        })
    }

    render() {
        const {loadingHome, loadingConstants} = this.state;
        const loading = loadingHome || loadingConstants;
        if (loading)
            return <Loading/>;
        if (this.state.error) return <CriticalError message={this.state.error.message} code={this.state.error.status}/>;
        return (
            <ConstantsContext.Provider value={this.state.constants}>
                <TopBar user={this.state.user} />
                <div className='app-body'>
                    <main className='main'>
                        <div className='container-fluid mt-3'>
                            <Switch>
                                {this.state.defaultUrl && <Route exact path='/' component={() => <Redirect replace to={this.state.defaultUrl}/>}/>}
                                <Route path='/clan' render={(props) => <ClanApp {...props} mainClan={this.state.mainClan}/>}/>
                                <Route path='/player' component={PlayerApp}/>
                                <Route render={routeProps => <CriticalError {...routeProps}
                                                                            code={404} description="Not found"
                                                                            message="We're sorry, we cannot find what you are looking for :("/>}/>
                            </Switch>
                        </div>
                    </main>
                </div>
                <footer>&nbsp;</footer>
            </ConstantsContext.Provider>
        )
    }
}
