import { withAccelerate } from "@prisma/extension-accelerate";
import { PrismaClient } from "./generated/prisma/edge"

let prisma: PrismaClient | null = null;

export function getDB(env: { CONNECTION_POOL_URL: string }) {
    if (!prisma) {
      prisma = new PrismaClient({
        datasourceUrl: env.CONNECTION_POOL_URL,
      }).$extends(withAccelerate()) as unknown as PrismaClient;
    }
    return prisma;
  }
