import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import type { Env } from "../types/env";
import { PrismaClient } from "../generated/prisma/edge";
import { withAccelerate } from "@prisma/extension-accelerate";

export function createAuth(env: Env) {
  const db = new PrismaClient({
    datasourceUrl: env.CONNECTION_POOL_URL
  }).$extends(withAccelerate());

  return betterAuth({
    database: prismaAdapter(db, {
      provider: "postgresql",
    }),
    emailAndPassword: {
      enabled: true,
    },
    trustedOrigins: ["http://localhost:5173"],
  });
}
