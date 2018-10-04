const { handleErrors, playerLeagueFromTrophies } = require('./api');
const { images } = require('./assets');
let { describe, it, expect } = global;

test('handleErrors returns JSON', () => {
    expect(handleErrors({
        json: () => {
            return 42
        }, ok: true
    })).toBe(42);
});

test('handleErrors throws when request is invalid', () => {
    expect(() => handleErrors({ json: () => {}, ok: false })).toThrow()
});

test('playerLeagueFromTrophies computes the player league from trophies', () => {
    expect(playerLeagueFromTrophies(1)).toBe(0);
    expect(playerLeagueFromTrophies(4000)).toBe(1);
    expect(playerLeagueFromTrophies(10000)).toBe(21)
});

test('assets.image returns an image URL with https', () => {
    for (let key in images) {
        // skip loop if the property is from prototype
        if (!images.hasOwnProperty(key)) continue;

        let result = images[key];
        if (result && {}.toString.call(result) === '[object Function]')
            result = result(42);
        expect(result).toEqual(expect.stringMatching(/.*\.(png|jpg|gif|svg)/))
    }
});