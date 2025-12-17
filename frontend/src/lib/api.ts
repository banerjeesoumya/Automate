import axios from "axios";
import { Credential } from "./utils";

const BACKEND_URL = "https://backend.banerjeerik03.workers.dev/api";

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
    const response = await api.post<WorkflowResponse>("/workflows/create");
    return response.data;
  },

  getOneWorkflow: async (id?: string) => {
    const response = await api.get<GetOneWorkflowResponse>(`/workflows/get/${id}`);
    return response.data;
  },

  getManyWorkflows: async (params: { page: number; pageSize: number; search?: string }) => {
    const response = await api.get<PaginatedWorkflowResponse>("/workflows/all", { params });
    return response.data;
  },

  deleteWorkflow: async (params: { id: string }) => {
    const response = await api.delete<WorkflowResponse>(`/workflows/delete/${params.id}`);
    return response.data;
  },

  updateWorkflowName: async (params: { id: string }, name: string) => {
    const response = await api.patch<WorkflowResponse>(`/workflows/update/${params.id}`, { name });
    return response.data;
  },

  updateWorkflowNodesAndEdges: async (params: { id: string }, nodes: NodeData[], edges: EdgeData[]) => {
    const response = await api.put(`/workflows/update/${params.id}/nodes`, { nodes, edges });
    return response.data;
  }
};

export interface DeleteCredentialResponse {
  ok: boolean;
  message: string;
  deletedCredential: {
    id: string;
    name: string;
    type: string;
    value: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface GetCredentialByType {
  ok: boolean;
  credentials: Credential[];
  message: string;
}

export interface GetOneCredentialResponse {
  ok: boolean;
  credential: Credential;
  message: string;
} 

export interface PaginatedCredentialResponse {
  ok: boolean;
  items: Credential[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  message: string;
}

export interface UpdateCredentialResponse {
  ok: boolean;
  message: string;
  credential: Credential;
}

export interface CreateCredentialResponse {
  ok: boolean;
  message: string;
  credential: {
    id: string;
    name: string;
    type: string;
  }
}

export const credentialApi = {
  createCredential: async (name: string, type: string, value: string) => {
    const response = await api.post<CreateCredentialResponse>("/credentials/create", {
      name,
      type,
      value,
    });
    return response.data;
  },
  deleteCredential: async (params: { id: string }) => {
    const response = await api.delete<DeleteCredentialResponse>(`/credentials/${params.id}`);
    return response.data;
  },
  updateCredential: async (params: { id: string }, name?: string, type?: string, value?: string) => {
    const response = await api.put<UpdateCredentialResponse>(`/credentials/${params.id}`, { name, type, value });
    return response.data;
  },
  getOneCredential: async (params: {id: string}) => {
  const response = await api.get<GetOneCredentialResponse>(`/credentials/${params.id}`);

  return response.data;
},

  getManyCredentials: async (params: { page: number; pageSize: number; search?: string }) => {
    const response = await api.get<PaginatedCredentialResponse>("/credentials/all", { params });

    return response.data;
  },

  getCredentialsByType: async (type: string) => {
    const response = await api.get<GetCredentialByType>("/credentials/type", {
      params: { type },
    });
    return response.data;
  }
}

// getManyCredentials: async (params: { page: number; pageSize: number; search?: string }) => {
//     const response = await api.get("/credentials/all", { params });
//     return response.data;
//   },