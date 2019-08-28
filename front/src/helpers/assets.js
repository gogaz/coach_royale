export const images = {
    static: (n, ext) => "/img/assets/" + n + '.' + (ext || "png"),
    arena: (i) => { return "https://raw.githubusercontent.com/RoyaleAPI/cr-api-assets/master/arenas/arena" + Number(i).toString() + '.png'},
    region: (region) => { return "https://raw.githubusercontent.com/hjnilsson/country-flags/master/png100px/" + region + '.png' },
};
