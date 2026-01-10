import { Hono } from "hono";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Env } from "../../types/env";
import { authMiddleware } from "../../utils/authMiddleware";
import { PrismaClient } from "../../generated/prisma/edge";
import { getAllExecutionsSchema } from "./types";


export const executionRouter = new Hono<{
    Bindings: Env,
    Variables: {
        userId?: string
        cloudflareWorkflowId?: string
    }
}>()

executionRouter.post("/test", authMiddleware(), async(c) => {
    console.log("Execution router accessed by user: ", c.get("userId"));
    return c.json({ message: "Execution router is working!" });
})

executionRouter.get("/get/:id", authMiddleware(), async(c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.CONNECTION_POOL_URL
    }).$extends(withAccelerate());

    const userId = c.get("userId");
    if (!userId) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    const executionId = c.req.param("id");
    if (!executionId) {
        return c.json({ error: "Execution ID is required" }, 400);
    }

    try {
        const execution = await prisma.execution.findUniqueOrThrow({
            where: {
                id: executionId,
                workflow: {
                    userId: userId
                }
            },
            include: {
                workflow: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        })
        return c.json({
            ok: true,
            message: "Execution fetched successfully",
            execution: execution
        })
    } catch (error) {
        console.error("Error fetching execution: ", error);
        return c.json({
            error: "Failed to fetch execution"
        }, 500)
    }
})

executionRouter.get("/stream/:id", async(c) => {
    const executionId = c.req.param("id");
    if (!executionId) {
        return c.json({ error: "Execution ID is required" }, 400);
    }
    const DOId = c.env.EXECUTION_STATE.idFromName(executionId);
    const executionStateDO = c.env.EXECUTION_STATE.get(DOId);
    return executionStateDO.fetch("https://do/connect", c.req.raw);
})

executionRouter.get("/all", authMiddleware(), async(c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.CONNECTION_POOL_URL
    }).$extends(withAccelerate());

    const userId = c.get("userId");
    if (!userId) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    const url = new URL(c.req.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());

    const parseResult = getAllExecutionsSchema.safeParse(queryParams);
    if (!parseResult.success) {
        return c.json({ message: "Invalid request", errors: parseResult.error.errors }, 400);
    }

    const { page, pageSize, search } = parseResult.data;

    try {
        const [items, totalCount] = await Promise.all([
            prisma.execution.findMany({
                skip: (page - 1) * pageSize,
                take: pageSize,
                where: {
                    workflow: {
                        userId: userId,
                    }
                },
                orderBy: {
                    startedAt: "desc"
                },
                include: {
                    workflow: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            }),
            prisma.execution.count({
                where: {
                    workflow: {
                        userId: userId,
                    }
                }
            })
        ]);

        const totalPages = Math.ceil(totalCount / pageSize);
        const hasNextPage = page < totalPages;
        const hasPreviousPage = page > 1;

        return c.json({
            ok: true,
            items: items,
            page,
            pageSize,
            totalCount,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
            message: "Executions fetched successfully"
        })
    } catch (error) {
        console.error("Error fetching executions: ", error);
        return c.json({
            error: "Failed to fetch executions"
        }, 500)
    }
})