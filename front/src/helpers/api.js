import moment from "moment";

export function handleErrors(response) {
    if (!response.ok) {
        throw Error(response.statusText);
    }
    return response.json();
}

export const locale = window.navigator.userLanguage || window.navigator.language;
moment.locale(locale);