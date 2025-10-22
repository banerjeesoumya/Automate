import axios from "axios"

const BACKEND_URL = "http://127.0.0.1:8787"
const BACKEND_AUTH_URL_PREFIX = "/api/auth"

export const api = axios.create({
    baseURL: BACKEND_URL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
})

export const authApi = axios.create({
    baseURL: BACKEND_URL,
    headers: {
        "Content-Type": "application/json",
        "Cookie": document.cookie,
    },
    withCredentials: true,
})

export const sessionApi = {
    get: async () => {
        const response = await authApi.get("/api/hello")
        return response 
    }
} 