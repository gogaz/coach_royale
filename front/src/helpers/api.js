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

export function playerLeagueFromTrophies(trophies) {
    let r = Number((Number(trophies) - 4000) / 300);
    return r < 0 ? 0 : Math.floor(r) + 1;
}

export function setTitle(title) {
    document.title = "Coach Royale" + title.length ? ' ' + title : '';
}

export function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

export const cookies = {
    csrf: 'csrftoken',
};