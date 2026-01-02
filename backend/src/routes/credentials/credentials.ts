import { Hono } from "hono";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Env } from "../../types/env";
import { authMiddleware } from "../../utils/authMiddleware";
import { CredentialType, PrismaClient } from "../../generated/prisma/edge";
import { createCredentialSchema, getAllCredentialsSchema, updateCredentialSchema } from "./types";

export const credentialRouter = new Hono<{
    Bindings: Env;
    Variables: {
        userId?: string;
    }
}>();

credentialRouter.post("/test", authMiddleware, async(c) => {
    console.log("Credential test route accessed by user:", c.get("userId"));
    return c.json({message: "Credential test route works!"});
})


credentialRouter.post("/create", authMiddleware(), async(c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.CONNECTION_POOL_URL,
    }).$extends(withAccelerate());
    if (!prisma.$accelerate) {
        return c.json({ error: "Prisma Accelerate not initialized" }, 500);
    }

    const userId = c.get("userId");
    if (!userId) {
        return c.json({ error: "Unauthorized" }, 401);
    }
    const body = await c.req.json();
    const parsed = createCredentialSchema.safeParse(body);
    if (!parsed.success) {
        return c.json({
            message: "Invalid request",
            errors: parsed.error.errors
        }, 400)
    }
    try {
        const credential = await prisma.credential.create({
            data: {
                name: parsed.data.name,
                type: parsed.data.type,
                value: parsed.data.value,
                userId: userId,
            }
        });
        return c.json({
            ok: true,
            message: "Credential created successfully",
            credential: {
                id: credential.id,
                name: credential.name,
                type: credential.type,
            }
        }, 201)
    } catch (err) {
        console.error("Error creating credential:", err);
        return c.json({
            message: "Internal server error"
        }, 500)
    }
})


credentialRouter.put("/:id", authMiddleware(), async(c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.CONNECTION_POOL_URL,
    }).$extends(withAccelerate());
    if (!prisma.$accelerate) {
        return c.json({ error: "Prisma Accelerate not initialized" }, 500);
    }

    const userId = c.get("userId");
    if (!userId) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    const credentialId = c.req.param("id");
    if (!credentialId) {
        return c.json({ error: "Credential ID is required" }, 400);
    }

    const body = await c.req.json();
    const parsed = updateCredentialSchema.safeParse(body);
    if (!parsed.success) {
        return c.json({
            message: "Invalid request",
            errors: parsed.error.errors
        }, 400)
    }

    try {
        const existingCredential = await prisma.credential.update({
            where: {
                id: credentialId,
                userId: userId,
            }, 
            data: {
                name: parsed.data.name,
                value: parsed.data.value,
                type: parsed.data.type,
            }
        });
        return c.json({
            ok: true,
            message: "Credential updated successfully",
            updatedCredential: existingCredential
        })
    } catch (err) {
        console.error("Error updating credential:", err);
        return c.json({
            message: "Internal server error"
        }, 500)
    }
})


credentialRouter.get("/all", authMiddleware(), async(c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.CONNECTION_POOL_URL,
    }).$extends(withAccelerate());
    if (!prisma.$accelerate) {
        return c.json({ error: "Prisma Accelerate not initialized" }, 500);
    }

    const userId = c.get("userId");
    if (!userId) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    const url = new URL(c.req.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());

    const parseResult = getAllCredentialsSchema.safeParse(queryParams);
    if (!parseResult.success) {
        return c.json({ message: "Invalid request", errors: parseResult.error.errors }, 400);
    }

    const { page, pageSize, search } = parseResult.data;

    try {
        const [items, totalCount] = await Promise.all([
            prisma.credential.findMany({
                skip: (page - 1) * pageSize,
                take: pageSize,
                where: {
                    userId: userId,
                    name: {
                        contains: search,
                        mode: "insensitive"
                    },
                },
                orderBy: {
                    updatedAt: "desc"
                }
            }),
            prisma.credential.count({
                where: {
                    userId: userId,
                    name: {
                        contains: search,
                        mode: "insensitive"
                    },
                }
            })
        ])

        const totalPages = Math.ceil(totalCount / pageSize);
        
        return c.json({
            ok: true,
            items,
            page,
            pageSize,
            totalCount,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
            message: "Credentials fetched successfully"
        })
    } catch (err) {
        console.error("Error fetching credentials:", err);
        return c.json({
            message: "Internal server error"
        }, 500)
    }
})

credentialRouter.get("/:id", authMiddleware(), async(c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.CONNECTION_POOL_URL,
    }).$extends(withAccelerate());
    if (!prisma.$accelerate) {
        return c.json({ error: "Prisma Accelerate not initialized" }, 500);
    }

    const userId = c.get("userId");
    if (!userId) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    const credentialId = c.req.param("id");
    if (!credentialId) {
        return c.json({ error: "Credential ID is required" }, 400);
    }

    try {
        const credential = await prisma.credential.findUniqueOrThrow({
            where: {
                id: credentialId,
                userId: userId,
            }
        })
        return c.json({
            ok: true,
            credential,
            message: "Credential fetched successfully"
        })
    } catch (err) {
        console.error("Error fetching credential:", err);
        return c.json({
            message: "Internal server error"
        }, 500)
    }
})

credentialRouter.get("/type/:type", authMiddleware(), async(c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.CONNECTION_POOL_URL,
    }).$extends(withAccelerate());
    if (!prisma.$accelerate) {
        return c.json({ error: "Prisma Accelerate not initialized" }, 500);
    }

    const userId = c.get("userId");
    if (!userId) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    const credentialType = c.req.param("type") as CredentialType;
    if (!credentialType) {
        return c.json({ error: "Credential type is required" }, 400);
    }

    console.log("Fetching credentials of type:", credentialType);

    try {
        const existingCredentials = await prisma.credential.findMany({
            where: {
                userId: userId,
                type: credentialType,
            },
            orderBy: {
                updatedAt: "desc"
            }
        })
        return c.json({
            ok: true,
            credentials: existingCredentials,
            message: "Credentials fetched successfully"
        })
    } catch (err) {
        console.error("Error fetching credentials by type:", err);
        return c.json({
            message: "Internal server error"
        }, 500)
    }
})

credentialRouter.delete("/:id", authMiddleware(), async(c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.CONNECTION_POOL_URL,
    }).$extends(withAccelerate());
    if (!prisma.$accelerate) {
        return c.json({ error: "Prisma Accelerate not initialized" }, 500);
    }

    const userId = c.get("userId");
    if (!userId) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    const credentialId = c.req.param("id");
    if (!credentialId) {
        return c.json({ error: "Credential ID is required" }, 400);
    }

    try {
        const deletedCredential = await prisma.credential.delete({
            where: {
                id: credentialId,
                userId: userId,
            }
        })
        return c.json({
            ok: true,
            message: "Credential deleted successfully",
            deletedCredential,
        })
    } catch (err) {
        console.error("Error deleting credential:", err);
        return c.json({
            message: "Internal server error"
        }, 500)
    }
})