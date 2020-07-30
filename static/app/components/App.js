import React from 'react'
import { Route, Switch } from 'react-router-dom'
import Layout from './Layout'

const App = () => (
    <Switch>
        <Route path='/' component={ Layout }/>;
    </Switch>
);

export default App;