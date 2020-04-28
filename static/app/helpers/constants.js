import React from "react";
import axios from "axios";

export const ConstantsContext = React.createContext({});
export const ConstantsProvider = ConstantsContext.Provider;

function fetchData(url) {
    return axios.get(url).then(response => response.data);
}

export async function loadConstants() {
    return {
        arenas: await fetchData('/static/constants/arenas.json'),
    };
}

export function playerArenaFromTrophies(constants, trophies) {
    const arena = constants.arenas.slice(1).find((e, i, array) => i === array.length-1 || trophies < array[i+1].trophy_limit);
    return arena ? arena.arena : null;
}
