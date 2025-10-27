import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
    baseURL: "https://backend.banerjeerik03.workers.dev/api/auth",
    fetchOptions: {
        credentials: "include"
    }
})

