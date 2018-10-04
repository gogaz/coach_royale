export function handleErrors(response) {
    if (!response.ok) {
        if (response.status >= 502) {
            throw Error("Application is under maintenance. Please try again later.");
        }
        throw response;
    }
    return response.json();
}

export const locale = window.navigator.userLanguage || window.navigator.language;
require('moment').locale(locale);

export function playerLeagueFromTrophies(trophies) {
    let r = Number((Number(trophies) - 4000) / 300);
    return r < 0 ? 0 : Math.floor(r) + 1;
}

export function setTitle(title) {
    document.title = "Coach Royale" + title.length ? ' ' + title : '';
}