export const images = {
    static: (i, ext) => "/img/assets/" + i + '.' + (ext || "png"),
    arena: (i) => { return "https://raw.githubusercontent.com/RoyaleAPI/cr-api-assets/master/arenas/arena" + Number(i).toString() + '.png'},
    league: (i) => { return "https://raw.githubusercontent.com/RoyaleAPI/cr-api-assets/master/arenas/league" + Number(i).toString() + '.png'},
    region: (region) => { return "https://raw.githubusercontent.com/hjnilsson/country-flags/master/png100px/" + region + '.png' },
};
