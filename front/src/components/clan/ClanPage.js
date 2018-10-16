import React from 'react';
import ClanDetails from "./ClanDetails";
import ClanMembers from "./ClanMembers";
import { Tab, Tabs } from "../ui/Tabs";
import ClanWarMembers from "./ClanWarMembers";

export default class ClanPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            endPoint: "/api/clan/" + props.match.params.tag,
        }
    }
    render() {
        const {match} = this.props;

        return (
            <div className="card">
                <ClanDetails endpoint={this.state.endPoint} />
                <Tabs match={match}>
                    <Tab id="members" label="Clan members" default><ClanMembers endpoint={this.state.endPoint} /></Tab>
                    <Tab id="war" label="War log"><ClanWarMembers endpoint={this.state.endPoint} /></Tab>
                </Tabs>
            </div>
        );
    }
}