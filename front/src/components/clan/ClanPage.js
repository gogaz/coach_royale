import React from 'react'
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
        return (
            <div className="card">
                <ClanDetails endpoint={this.state.endPoint} />
                <Tabs>
                    <Tab id='members' label='Clan members'><ClanMembers endpoint={this.state.endPoint} /></Tab>
                    <Tab id='war' label="War"><ClanWarMembers endpoint={this.state.endPoint} /></Tab>
                </Tabs>
            </div>
        );
    }
}