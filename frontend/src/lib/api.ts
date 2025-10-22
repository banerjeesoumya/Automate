import axios from "axios"

const BACKEND_URL = "http://127.0.0.1:8787/api"


export const api = axios.create({
    baseURL: BACKEND_URL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
})

export const workflowApi = {
    createWorkflow: async () => {
        const response = await api.post("/workflows");
        return response.data;
    }
}