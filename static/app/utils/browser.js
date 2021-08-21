export function setTitle(title) {
    document.title = "Coach Royale" + (title.length ? ' - ' + title : '');
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
    csrf: () => getCookie('csrftoken'),
};

export const locale = window.navigator.userLanguage || window.navigator.language || 'en-US';