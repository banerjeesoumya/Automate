import { Hono } from "hono";
import { Env } from "../types/env";
import { authMiddleware } from "../utils/authMiddleware";
import { CredentialType, PrismaClient } from "../generated/prisma";
import { withAccelerate } from "@prisma/extension-accelerate";
import z from "zod";
import { PAGINATION } from "../utils/constants";

export const credentialRouter = new Hono<{
    Bindings: Env,
    Variables: {
        userId?: string
    } 
}>();

const createCredentialSchema = z.object({
    name: z.string().min(1, "Name is required"),
    type: z.string().refine((val) => Object.values(CredentialType).includes(val as CredentialType), {
        message: "Invalid credential type",
    }),
    value: z.string().min(1, "Value is required"),
})

credentialRouter.post('/credentials', authMiddleware, async(c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.CONNECTION_POOL_URL
    }).$extends(withAccelerate());

    const userId = c.get("userId");

    if (!userId) {
        return c.json({ error: "User not logged in" }, 401);
    }

    const { name, type, value } = await c.req.json();

    const correctCreateCredentialData = createCredentialSchema.safeParse({ name, type, value });

    if (!correctCreateCredentialData.success) {
        return c.json({
            error: correctCreateCredentialData.error.errors.map((e) => e.message).join(", ")
        }, 400);
    }

    try {
        const newCredential = await prisma.credential.create({
            data: {
                name: correctCreateCredentialData.data.name,
                type: correctCreateCredentialData.data.type as CredentialType,
                value: correctCreateCredentialData.data.value, // In a real application, ensure to encrypt sensitive data before storing
                userId: userId
            }
        })
        return c.json({
            ok: true,
            credential: newCredential
        }, 201)
    } catch (error) {
        console.error("ERROR MESSAGE", error);
        return c.json({
            ok: false,
            message: "Error creating credential"
        }, 500);
    }
})

const deleteWorkflowSchema = z.object({
    id: z.string()
})

credentialRouter.delete('/credentials/:id', authMiddleware, async(c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.CONNECTION_POOL_URL
    }).$extends(withAccelerate());

    const userId = c.get("userId");

    if (!userId) {
        return c.json({ error: "User not logged in" }, 401);
    }

    const credentialId = c.req.param('id');
    const correctDeleteCredentialData = deleteWorkflowSchema.safeParse({ id: credentialId });

    if (!correctDeleteCredentialData.success) {
        return c.json({
            error: correctDeleteCredentialData.error.errors.map((e) => e.message).join(", ")
        }, 400);
    }

    try {
        const deleteCredential = await prisma.credential.delete({
            where: {
                id: correctDeleteCredentialData.data.id,
                userId: userId
            }
        })
        return c.json({
            ok: true,
            credential: deleteCredential,
            message: "Credential deleted successfully"
        }, 200)
    } catch (error) {
        console.error("ERROR MESSAGE", error);
        return c.json({
            ok: false,
            message: "Error deleting credential"
        }, 500);
    }
})

const updateCredentialSchema = z.object({
    name: z.string().min(1, "Name is required").optional(),
    type: z.string().refine((val) => Object.values(CredentialType).includes(val as CredentialType), {
        message: "Invalid credential type",
    }).optional(),
    value: z.string().min(1, "Value is required").optional(),
})

credentialRouter.put('/credentials/:id', authMiddleware, async(c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.CONNECTION_POOL_URL
    }).$extends(withAccelerate());
    const userId = c.get("userId");

    if (!userId) {
        return c.json({ error: "User not logged in" }, 401);
    }

    const credentialId = c.req.param('id');

    if (!credentialId) {
        return c.json({ error: "Credential ID is required" }, 400);
    }

    const { name, type, value } = await c.req.json();

    const correctUpdateCredentialData = updateCredentialSchema.safeParse({ name, type, value });

    if (!correctUpdateCredentialData.success) {
        return c.json({
            error: correctUpdateCredentialData.error.errors.map((e) => e.message).join(", ")
        }, 400);
    }

    try {
        const updatedCredential = await prisma.credential.update({
            where: {
                id: credentialId,
                userId: userId
            },
            data: {
                name: correctUpdateCredentialData.data.name,
                type: correctUpdateCredentialData.data.type as CredentialType,
                value: correctUpdateCredentialData.data.value, // In a real application, ensure to encrypt sensitive data before storing
            }
        })
        return c.json({
            ok: true,
            credential: updatedCredential,
            message: "Credential updated successfully"
        }, 200)
    } catch (error) {
        console.error("ERROR MESSAGE", error);
        return c.json({
            ok: false,
            message: "Error updating credential"
        }, 500);
    }
})

const getOneCredentialSchema = z.object({
    id: z.string()
})

credentialRouter.get('/credentials/:id', authMiddleware, async(c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.CONNECTION_POOL_URL
    }).$extends(withAccelerate());
    const userId = c.get("userId");
    
    if (!userId) {
        return c.json({ error: "User not logged in" }, 401);
    }
    
    const parsedResult = getOneCredentialSchema.safeParse({
        id: c.req.param('id')
    })

    if (!parsedResult.success) {
        return c.json({
            error: parsedResult.error.errors.map((e) => e.message).join(", ")
        }, 400);
    }

    try {
        const credential = await prisma.credential.findUniqueOrThrow({
            where: {
                id: parsedResult.data.id,
                userId: userId
            },
        })
        return c.json({
            ok: true,
            credential: credential,
            message: "Credential fetched successfully"
        }, 200)
    } catch (error) {
        console.error("ERROR MESSAGE", error);
        return c.json({
            ok: false,
            message: "Error fetching credential"
        }, 500);
    }
})

const getAllCredentialSchema = z.object({
    page: z
        .string()
        .default(String(PAGINATION.DEFAULT_PAGE))
        .transform((val) => Number(val)),
    pageSize: z
        .string()
        .default(String(PAGINATION.DEFAULT_PAGE_SIZE))
        .transform((val) => Number(val))
        .refine((val) => val >= PAGINATION.MIN_PAGE_SIZE && val <= PAGINATION.MAX_PAGE_SIZE, {
            message: `pageSize must be between ${PAGINATION.MIN_PAGE_SIZE} and ${PAGINATION.MAX_PAGE_SIZE}`,
        }),
    search: z.string().optional().default(""),
})

credentialRouter.get('/credentials/all', authMiddleware, async(c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.CONNECTION_POOL_URL
    }).$extends(withAccelerate());

    const userId = c.get("userId");
    if (!userId) {
        return c.json({ error: "User not logged in" }, 401);
    }

    const url = new URL(c.req.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());

    const parseResult = getAllCredentialSchema.safeParse(queryParams);
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
            userId,
            name: {
                contains: search,
                mode: "insensitive",
            },
            },
            orderBy: { updatedAt: "desc" },
        }),
        prisma.credential.count({
            where: {
            userId,
            name: {
                contains: search,
                mode: "insensitive",
            },
            },
        }),
        ]);

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
        message: "credentials fetched successfully",
        });
    } catch (error) {
        console.error("Error fetching credentials:", error);
        return c.json({ ok: false, message: "Error fetching credentials" }, 500);
    }
})