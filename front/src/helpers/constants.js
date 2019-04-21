export let arenas = [];

export function playerArenaFromTrophies(trophies) {
    const arena =  arenas.find(() => {return {trophy_limit: trophies};});
    if (arena !== undefined)
        return arena.arena;
    return 0;
}

export function loadConstants() {
    fetch('/constants/arenas.json').then(res => res.json()).then((res) => arenas = res);
}
