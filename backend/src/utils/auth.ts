import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDB } from "../db/client";
import type { Env } from "../types/env";

export function createAuth(env: Env) {
  const db = getDB(env);

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "sqlite",
    }),
    emailAndPassword: {
      enabled: true,
    },
    trustedOrigins: ["http://localhost:5173"],
  });
}
