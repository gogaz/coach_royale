import React from "react";
import PlayerStats from "./PlayerStats";
import PlayerActivityStats from "./PlayerActivityStats";

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
                <PlayerStats endpoint={this.state.endpoint}/>
                <div className="card-body" >
                    <PlayerActivityStats endpoint={this.state.endPoint} />
                </div>
            </div>
        );
    }
}