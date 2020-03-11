export function handleErrors(response) {
    if (response.status !== 200) {
        if (response.status >= 502) {
            throw Error("Application is under maintenance. Please try again later.");
        }
        throw response;
    }
    console.log(response.data);
    return response.data;
}