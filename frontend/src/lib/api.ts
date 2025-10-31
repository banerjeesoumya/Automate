import axios from "axios";

const BACKEND_URL = "http://127.0.0.1:8787/api";

// === Types ===
export interface NodeData {
  id: string;
  type: string;
  data: Record<string, any>;
  position: { x: number; y: number };
}

export interface EdgeData {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  type?: string;
}

export interface Workflow {
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
  userId?: string;
  nodes?: NodeData[];
  edges?: EdgeData[];
}

export interface WorkflowResponse {
  ok: boolean;
  workflow: Workflow;
  message: string;
}

export interface GetOneWorkflowResponse {
  ok: boolean;
  id: string;
  name: string;
  nodes: NodeData[];
  edges: EdgeData[];
  message: string;
}

export interface PaginatedWorkflowResponse {
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

// === Axios instance ===
export const api = axios.create({
  baseURL: BACKEND_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// === API functions ===

export const credsApi = {
  signUpWithEmail: async (email: string, password: string, name?: string) => {
    const response = await api.post("/creds/signup", {
      email,
      password,
      name,
    });
    return response.data;
  },
  signInWithEmail: async (email: string, password: string) => {
    const response = await api.post("/creds/signin", {
      email,
      password,
    });
    return response.data;
  },
  signOut: async () => {
    const response = await api.post("/creds/signout");
    return response.data;
  },
  getSession: async () => {
    try {
      const response = await api.get("/creds/get-session");
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        // Expected — user is signed out
        return { session: null, user: null };
      }
      throw error; // Re-throw any unexpected errors
    }
  },
}



export const workflowApi = {
  createWorkflow: async () => {
    const response = await api.post<WorkflowResponse>("/workflows");
    return response.data;
  },

  getOneWorkflow: async (id?: string) => {
    const response = await api.get<GetOneWorkflowResponse>(`/workflows/${id}`);
    return response.data;
  },

  getManyWorkflows: async (params: { page: number; pageSize: number; search?: string }) => {
    const response = await api.get<PaginatedWorkflowResponse>("/workflows/all", { params });
    return response.data;
  },

  deleteWorkflow: async (params: { id: string }) => {
    const response = await api.delete<WorkflowResponse>(`/workflows/${params.id}`);
    return response.data;
  },

  updateWorkflowName: async (params: { id: string }, name: string) => {
    const response = await api.patch<WorkflowResponse>(`/workflows/${params.id}`, { name });
    return response.data;
  },

  updateWorkflowNodesAndEdges: async (params: { id: string }, nodes: NodeData[], edges: EdgeData[]) => {
    const response = await api.put(`/workflows/${params.id}/nodes`, { nodes, edges });
    return response.data;
  }
};
