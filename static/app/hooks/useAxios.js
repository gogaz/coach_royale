import { useState, useEffect } from 'react'
import axios from "axios";
import { handleErrors } from "../helpers/api";

const useAxios = (
    defaultData = null,
    onFetch = () => {
    },
    initiallyLoading = false,
    onCatch = () => {
    }
) => {
    const [response, setResponse] = useState(defaultData)
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(initiallyLoading)

    const sendRequest = (axiosOptions) => {
        setLoading(true);
        (async () => {
            axios(axiosOptions)
                .then((res) => {
                    const result = handleErrors(res)
                    onFetch(result)
                    setResponse(result)
                    setLoading(false)
                })
                .catch((e) => {
                    setError(e)
                    onCatch(e)
                    setLoading(false)
                })
        })()
    }

    return { response, error, loading, sendRequest }
}

export const useFetch = (url, defaultData, onFetch, initiallyLoading = false, ...opts) => {
    const axiosOpts = { method: 'GET', url }
    const { sendRequest, ...hookBag } = useAxios(defaultData, onFetch, initiallyLoading, ...opts)

    return {
        ...hookBag,
        sendRequest: () => sendRequest(axiosOpts),
    }
}

export const useAutoFetch = (url, defaultData, onFetch, ...opts) => {
    const { sendRequest, ...hookBag } = useFetch(url, defaultData, onFetch, true, ...opts)

    useEffect(sendRequest, [])

    return hookBag
}

export default useAxios