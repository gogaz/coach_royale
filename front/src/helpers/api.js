export function handleErrors(response, sender) {
    if (!response.ok) {
        if (response.status >= 502) {
            sender.setState({error: {message: "Application is under maintenance. Please try again later"}});
            return;
        }
        else if (response.status === 404) {
            sender.setState({error: {message: ""}})
        }
        else if (response.status === 500) {
            sender.setState({error: {message: "There was an error accessing the resource. Please try again."}})
        }
        else sender.setState({error: {message: "Unknown error"}});
        throw Error();
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