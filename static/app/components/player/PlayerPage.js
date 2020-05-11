import React from "react";
import PlayerStats from "./PlayerStats";
import PlayerActivityStats from "./PlayerActivityStats";
import ErrorBoundary from "../errors/ErrorBoundary";

const PlayerPage = ({ match }) => {
    const endpoint = "/api/player/" + match.params.tag;

    return (
        <div className="card">
            <PlayerStats endpoint={ endpoint }/>
            <div className="card-body">
                <ErrorBoundary>
                    <PlayerActivityStats endpoint={ endpoint }/>
                </ErrorBoundary>
            </div>
        </div>
    );
};

export default PlayerPage;