import {  D1Database, DurableObjectNamespace } from "@cloudflare/workers-types"

export type Env = {
    hr_d1 : D1Database
    JWT_SECRET: string,
    CONNECTION_POOL_URL: string,
    CHAT_ROOM: DurableObjectNamespace
    AI: Ai
}