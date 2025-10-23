import axios from "axios"

const BACKEND_URL = "http://127.0.0.1:8787/api"

interface Workflow {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface WorkflowResponse {
  ok: boolean;
  workflow: Workflow;
  message: string;
}

export const api = axios.create({
    baseURL: BACKEND_URL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
})

export const workflowApi = {
    createWorkflow: async () => {
        const response = await api.post<WorkflowResponse>("/workflows");
        return response.data;
    },
    getOneWorkflow: async (id?: string) => {
        const response = await api.get<WorkflowResponse>(`/workflows/${id}`);
        return response.data;
    },
    getManyWorkflows: async () => {
        const response = await api.get<WorkflowResponse[]>("/workflows/all");
        return response.data;
    } 
}