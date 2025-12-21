import {  D1Database, DurableObjectNamespace } from "@cloudflare/workers-types"

export type Env = {
    hr_d1 : D1Database
    JWT_SECRET: string,
    CONNECTION_POOL_URL: string,
    CHAT_ROOM: DurableObjectNamespace
    AI: Ai,
    NODE_ENV: 'development' | 'production',
    MY_WORKFLOW:  Workflow<Params>
}

type Params = {
  email: string;
  id: "execute-workflow";
  eventName: "workflows/execute.workflow";
  workflowId?: string;
  initialData?: {};
};