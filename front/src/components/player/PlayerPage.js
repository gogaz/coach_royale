import React from "react";
import PlayerStats from "./PlayerStats";
import PlayerActivityStats from "./PlayerActivityStats";

const PlayerPage = ({ match }) => {
    const endpoint = "/api/player/" + match.params.tag;

    return (
        <div className="card">
            <PlayerStats endpoint={ endpoint }/>
            <div className="card-body">
                <PlayerActivityStats endpoint={ endpoint }/>
            </div>
        </div>
    );
};

export default PlayerPage;