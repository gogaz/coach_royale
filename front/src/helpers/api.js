import moment from "moment";

export function handleErrors(response) {
    if (!response.ok) {
        throw Error(response.statusText);
    }
    return response.json();
}

export const locale = window.navigator.userLanguage || window.navigator.language;
moment.locale(locale);

export function playerLeagueFromTrophies(trophies) {
    let r = Number((Number(trophies) - 4000) / 300);
    return r < 0 ? 0 : Math.floor(r) + 1;
}