import React from "react";
import PlayerStats from "./PlayerStats";
import {Tab, Tabs} from "../ui/Tabs";

export default class PlayerPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            endpoint: "/api/player/" + props.match.params.tag,
        }
    }

    render () {
        return (
            <div className="card">
                <Tabs match={this.props.match}>
                    <Tab id="members" label="Clan members" default><PlayerStats endpoint={this.state.endpoint}/></Tab>
                    <Tab id="war" label="War log"><PlayerActivityStats endpoint={this.state.endPoint} /></Tab>
                </Tabs>
            </div>
        );
    }
}