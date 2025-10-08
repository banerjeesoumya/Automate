import { D1Database } from "@cloudflare/workers-types"

export type Env = {
    hr_d1 : D1Database
    JWT_SECRET: string
}