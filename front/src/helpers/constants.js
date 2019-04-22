import React from "react";

export const ConstantsContext = React.createContext({});

export function loadConstants() {
    const constants = [
        fetch('/constants/arenas.json').then(res => res.json()),
    ];
    return Promise.all(constants);
}

export function playerArenaFromTrophies(context, trophies) {
    const arena = context.arenas.slice(1).find((e, i, array) => i === array.length-1 || trophies < array[i+1].trophy_limit);
    return arena.arena;
}
