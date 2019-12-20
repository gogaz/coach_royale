import React from "react"
import axios from "axios";
import { Route, Switch } from "react-router-dom";
import ClanPage from "./ClanPage";
import { handleErrors } from "../../helpers/api";
import { setTitle } from "../../helpers/browser";

export default class ClanApp extends React.Component {
    componentDidMount() {

    }
    render() {
        return (<div>
            <Switch>
                <Route exact path={this.props.match.url + "/"} render={(props) => <ClanList {...props} mainClan={this.state.mainClan} />}/>
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
        setTitle("Available clans");
        axios.get(this.props.endpoint)
            .then(res => handleErrors(res))
            .then(res => this.setState({tournaments: res, loading: false}))
            .catch(error => console.log(error))
    }

    render() {
        return (
            <ul>
                { this.state.clans.map((e, key) => <li key={ key }>{ e }</li>) }
            </ul>
        );
    }
}