// import { PrismaClient } from "@/generated/prisma"

import { PrismaClient } from "@prisma/client/edge"


const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

// Create the client (edge-safe)
export const prisma =  globalForPrisma.prisma ?? new PrismaClient();

// Cache it only in development (safe for local dev)
if (typeof globalThis !== "undefined") {
  globalForPrisma.prisma = prisma;
}