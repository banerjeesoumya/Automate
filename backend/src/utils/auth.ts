import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import type { Env } from "../types/env";
import { getDB } from "../db/client"; // ✅ use the shared Prisma instance

export function createAuth(env: Env) {
  // ✅ reuse Prisma Accelerate client
  const db = getDB(env);

  // ✅ create BetterAuth instance (only once per Worker in index.ts)
  return betterAuth({
    database: prismaAdapter(db, {
      provider: "postgresql",
    }),

    // enable email/password auth
    emailAndPassword: {
      enabled: true,
      hash: {
        algorithm: "bcryptjs",
        cost: 8
      }
    },

    advanced: {
      defaultCookieAttributes: {
        sameSite: "none", // needed for cross-domain (vercel.app ↔ workers.dev)
        secure: true,     // only HTTPS
        partitioned: true,
      },
      internalFetch: false,

      // 🚫 disable if you don’t have subdomains
      // this can cause internal recursive fetches
      crossSubDomainCookies: {
        enabled: false,
      },
    },

    // ✅ production base URL
    baseURL: "https://backend.banerjeerik03.workers.dev",
    // baseURL: "http://127.0.0.1:8787",

    // ✅ allowed origins (CORS)
    trustedOrigins: [
      "https://backend.banerjeerik03.workers.dev",
      "https://automate-xi-jet.vercel.app",
      "https://automate-git-featureauth-soumya-banerjees-projects.vercel.app",
      "http://localhost:5173",
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