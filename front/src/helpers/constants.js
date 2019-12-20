import React from "react";
import axios from "axios";

export const ConstantsContext = React.createContext({});

export function loadConstants() {
    const constants = [
        axios.get('/constants/arenas.json').then(result => result.data),
    ];
    return Promise.all(constants);
}

export function playerArenaFromTrophies(context, trophies) {
    const arena = context.arenas.slice(1).find((e, i, array) => i === array.length-1 || trophies < array[i+1].trophy_limit);
    return arena.arena;
}
