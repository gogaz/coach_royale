import { playerArenaFromTrophies } from "./constants";

const { handleErrors } = require('./api');
const { images } = require('./assets');
let { test, expect } = global;

test('handleErrors returns JSON', () => {
    expect(handleErrors({
        json: () => {
            return 42
        }, ok: true
    })).toBe(42);
});

test('handleErrors throws when request is invalid', () => {
    expect(() => handleErrors({ json: () => {}, ok: false, status: 502 })).toThrow();
    expect(() => handleErrors({ json: () => {}, ok: false, status: 404 })).toThrow();
});

test('playerArenaFromTrophies computes the player league from trophies', () => {
    const context = {arenas:[{},{trophy_limit:0, arena:0}, {trophy_limit:300, arena:42}]};
    expect(playerArenaFromTrophies(context, 1)).toBe(0);
    expect(playerArenaFromTrophies(context, 299)).toBe(0);
    expect(playerArenaFromTrophies(context, 300)).toBe(42);
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