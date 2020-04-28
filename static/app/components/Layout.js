import React from 'react'
import { Redirect, Route, Switch } from "react-router-dom"
import ClanApp from "./clan/ClanApp";
import TopBar from "./ui/TopBar";
import PlayerApp from "./player/PlayerApp";
import CriticalError from "./errors/CriticalError";
import Loading from "./ui/Loading";

const Layout = ({ user }) => (
    <React.Fragment>
        <TopBar user={ user }/>
        <div className='app-body'>
            <main className='main'>
                <div className='container-fluid mt-3'>
                    <Switch>
                        <Route exact path='/' component={ () => <Redirect replace to={ window.GLOBAL_rootURL }/> }/>}
                        <Route path='/clan' render={ (props) => <ClanApp { ...props } mainClan={ window.GLOBAL_mainClan }/> }/>
                        <Route path='/player' component={ PlayerApp }/>
                        <Route render={ routeProps => <CriticalError { ...routeProps }
                                                                     code={ 404 } description="Not found"
                                                                     message="We're sorry, we cannot find what you are looking for :("/> }/>
                    </Switch>
                </div>
            </main>
        </div>
        <footer>&nbsp;</footer>
    </React.Fragment>
);

export default Layout;