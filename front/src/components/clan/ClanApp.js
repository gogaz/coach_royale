import React from "react"
import { Route, Switch } from "react-router-dom";
import ClanPage from "./ClanPage";

export default class ClanApp extends React.Component {
    componentDidMount() {

    }
    render() {
        return (<div>
            <Switch>
                <Route exact path={this.props.match.url + "/"} component={ ClanList } />
                <Route path={this.props.match.url + "/:tag"} component={ ClanPage } />
            </Switch>
        </div>)
    }
}

class ClanList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            clans: []
        }
    }

    componentDidMount() {

    }

    render() {
        return (
            <ul>{ this.state.clans.map((e, key) => {
                return <li key={ key }>{ e }</li>;
            }) }
            </ul>
        );
    }
}