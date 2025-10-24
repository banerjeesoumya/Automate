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

interface PaginatedWorkflowResponse {
  ok: boolean;
  items: Workflow[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  message: string;
}

export const api = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export const workflowApi = {
  createWorkflow: async () => {
    const response = await api.post<WorkflowResponse>("/workflows");
    return response.data;
  },

  getOneWorkflow: async (id?: string) => {
    const response = await api.get<WorkflowResponse>(`/workflows/${id}`);
    return response.data;
  },

  // ✅ Now supports pagination + search params
  getManyWorkflows: async (params: { page: number; pageSize: number; search?: string }) => {
    const response = await api.get<PaginatedWorkflowResponse>("/workflows/all", {
      params,
    });
    return response.data;
  },
};
