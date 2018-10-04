import React from 'react'
import ClanDetails from "./ClanDetails";
import ClanMembers from "./ClanMembers";

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
                <div className="card-body">
                    <ClanMembers endpoint={this.state.endPoint} />
                </div>
            </div>
        );
    }
}