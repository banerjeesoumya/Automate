import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import type { Env } from "../types/env";
import { getDB } from "@repo/db/client";

export function createAuth(env: Env) {
  const db = getDB(env);

  return betterAuth({
    database: prismaAdapter(db, {
      provider: "postgresql",
    }),

    emailAndPassword: {
      enabled: true,
      hash: {
        algorithm: "bcryptjs",
        cost: 8
      }
    },

    advanced: {
      defaultCookieAttributes: {
        sameSite: "none", 
        secure: true,     
        partitioned: true,
      },
      internalFetch: false,

      crossSubDomainCookies: {
        enabled: false,
      },
    },

    baseURL: "https://backend.banerjeerik03.workers.dev",
    trustedOrigins: [
      "https://backend.banerjeerik03.workers.dev",
      "https://automate-xi-jet.vercel.app",
      "http://localhost:3000",
      "http://127.0.0.1:3000",
    ],
  });
}

let _cachedAuth: ReturnType<typeof createAuth> | null = null;

export function getAuth(env: Env) {
  if (!_cachedAuth) {
    _cachedAuth = createAuth(env);
  }
  return _cachedAuth;
}