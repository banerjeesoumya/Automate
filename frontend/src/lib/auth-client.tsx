import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
    baseURL: "http://localhost:8787/api/auth",
    fetchOptions: {
        credentials: "include"
    }
})

