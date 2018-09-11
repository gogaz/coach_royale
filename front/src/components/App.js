import React from 'react'
import { Switch, Route, Redirect } from "react-router-dom"
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import ClanApp from "./clan/ClanApp";
import TopBar from "./ui/TopBar";


import "../style/app.css"
import { handleErrors } from "../helpers/api";
import PlayerApp from "./player/PlayerApp";

library.add(fas);

export default class App extends React.Component {
    constructor(props) {
      super(props);

      this.state = {
            user: null,
            defaultUrl: '',
    }
  }

    componentDidMount() {
      fetch('/api/home')
      .then(res => handleErrors(res))
      .then(res => this.setState({ defaultUrl: res.url }))
      .catch(error => console.log(error));
  }

    render() {
      return (
      <div>
          <TopBar user={this.state.user} />
          <div className='app-body'>
          <main className='main'>
              <div className='container-fluid mt-3'>
              <Switch>
                  {this.state.defaultUrl && <Route exact path='/' component={() => <Redirect to={this.state.defaultUrl} />} />}
                  <Route path='/clan' component={ClanApp} />
                  <Route path='/player' component={PlayerApp} />
                </Switch>
            </div>
            </main>
        </div>
          <footer>&nbsp;</footer>
        </div>
    )
  }
}
