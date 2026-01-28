import { betterAuth } from "better-auth";
import { getDB } from "@repo/db/client";
import { prismaAdapter } from "better-auth/adapters/prisma";

const db = getDB({
    CONNECTION_POOL_URL: process.env.CONNECTION_POOL_URL as string
})

export const auth = betterAuth({
    database: prismaAdapter(db, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
        autoSignIn: true,
    },
    socialProviders: {
        github: {
            clientId: process.env.GITHUB_CLIENT_ID as string,
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
        },
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        }
    },
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
    advanced: {
        defaultCookieAttributes: {
            sameSite: "none",
            secure: true,
        },
    },
})