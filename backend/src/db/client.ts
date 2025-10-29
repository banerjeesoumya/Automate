  import { PrismaClient } from "../generated/prisma/edge";
  import { withAccelerate } from "@prisma/extension-accelerate";

  let prisma: PrismaClient | null = null;

  // ✅ Cloudflare Workers create isolated instances per edge VM,
  // so caching once per instance is sufficient.
  export function getDB(env: { CONNECTION_POOL_URL: string }) {
    if (!prisma) {
      prisma = new PrismaClient({
        datasourceUrl: env.CONNECTION_POOL_URL,
      }).$extends(withAccelerate()) as unknown as PrismaClient;
    }
    return prisma;
  }
