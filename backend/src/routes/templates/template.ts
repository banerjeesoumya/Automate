import { Hono } from "hono";
import { Env } from "../../types/env";
import { authMiddleware } from "../../utils/authMiddleware";
import { PrismaClient } from "@repo/db/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { getAllTemplatesSchema, getOneTemplateSchema, useTemplateSchema } from "./types";
import { Node } from "@xyflow/react";
import { generateSlug } from "random-word-slugs";

export const templateRouter = new Hono<{
    Bindings: Env,
    Variables: {
        userId?: string
    }
}>();

templateRouter.get("/all", authMiddleware(), async(c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.CONNECTION_POOL_URL
    }).$extends(withAccelerate());

    const userId = c.get("userId");
    if (!userId) {
        return c.json({ error: "User not logged in" }, 401);
    }

    const url = new URL(c.req.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());

    const parseResult = getAllTemplatesSchema.safeParse(queryParams);
    if (!parseResult.success) {
        return c.json({ message: "Invalid request", errors: parseResult.error.message }, 400);
    }

    const { page, pageSize, search } = parseResult.data;

    try {
        const [items, totalCount] = await Promise.all([
            prisma.templateMeta.findMany({
                skip: (page - 1) * pageSize,
                take: pageSize,
                include: {
                    workflow: {
                        include: {
                            nodes: true,
                            connections: true
                        }
                    }
                },
                orderBy: {
                    updatedAt: "desc"
                }
            }),
            prisma.templateMeta.count({
                where: {
                    OR: [
                        { title: { contains: search } },
                        { description: { contains: search } }
                    ]
                }
            })
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
            message: "Templates retrieved successfully"
        });
    } catch (error) {
        console.error("Error retrieving templates:", error);
        return c.json({ ok: false, message: "Failed to retrieve templates" }, 500);
    }
})

templateRouter.get("/get/:id", authMiddleware(), async(c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.CONNECTION_POOL_URL
    }).$extends(withAccelerate());

    const userId = c.get("userId");
    if (!userId) {
        return c.json({ error: "User not logged in" }, 401);
    }

    const parsedResult = getOneTemplateSchema.safeParse({
        id: c.req.param("id")
    });
    if (!parsedResult.success) {
        return c.json({ message: "Invalid request", errors: parsedResult.error.message }, 400);
    }

    try {
        const template = await prisma.templateMeta.findUniqueOrThrow({
            where: {
                id: parsedResult.data.id,
            },
            include: {
                workflow: {
                    include: {
                        nodes: true,
                        connections: true
                    }
                }
            }
        })
        const nodes: Node[] = template.workflow.nodes.map((node) => ({
            id: node.id,
            type: node.type,
            position: node.position as { x: number, y: number },
            data: node.data as Record<string, unknown> || {}
        }))

        const edges = template.workflow.connections.map((conn) => ({
            id: conn.id,
            source: conn.fromNodeId,
            target: conn.toNodeId,
            sourceHandle: conn.fromOutput,
            targetHandle: conn.toInput,
        }))

        return c.json({
            ok: true,
            id: template.id,
            title: template.title,
            description: template.description,
            nodes,
            edges,
            message: "Template retrieved successfully"
        })
    } catch (error) {
        console.error("Error retrieving template:", error);
        return c.json({ ok: false, message: "Failed to retrieve template" }, 500);
    }
})

templateRouter.post("/use/:id", authMiddleware(), async(c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.CONNECTION_POOL_URL
    }).$extends(withAccelerate());

    const userId = c.get("userId");
    if (!userId) {
        return c.json({ error: "User not logged in" }, 401);
    }

    const parsedResult = useTemplateSchema.safeParse({
        id: c.req.param("id")
    });
    if (!parsedResult.success) {
        return c.json({ message: "Invalid request", errors: parsedResult.error.message }, 400);
    }

    try {
        const template = await prisma.templateMeta.findUniqueOrThrow({
            where: {
                id: parsedResult.data.id,
            },
            include: {
                workflow: {
                    include: {
                        nodes: true,
                        connections: true,
                    },
                },
            },
        });

        const templateWorkflow = template.workflow;

        // Step 1: Create a new workflow based on the template
        const newWorkflow = await prisma.workflow.create({
            data: {
                name: generateSlug(2),
                userId: userId,
                isTemplate: false
            }
        });

        // Step 2: Copy nodes from the template workflow to the new workflow
        const nodeMap = new Map<string, string>();

        
        for (const node of templateWorkflow.nodes) {
            const newNode = await prisma.node.create({
                data: {
                    name: node.name,
                    type: node.type,
                    data: node.data as Record<string, unknown> || {},
                    position: node.position as { x: number, y: number },
                    workflowId: newWorkflow.id
                }
            });

            nodeMap.set(node.id, newNode.id);
        }

        // Step 3: Copy connections from the template workflow to the new workflow
        for (const conn of templateWorkflow.connections) {
            await prisma.connection.create({
                data: {
                workflowId: newWorkflow.id,
                fromNodeId: nodeMap.get(conn.fromNodeId)!,
                toNodeId: nodeMap.get(conn.toNodeId)!,
                fromOutput: conn.fromOutput,
                toInput: conn.toInput
                }
            });
        }
        
        return c.json({
            ok: true,
            workflowId: newWorkflow.id,
            message: "Template used successfully"
        })
    } catch (error) {
        console.error("Error using template:", error);
        return c.json({ ok: false, message: "Failed to use template" }, 500);
    }
})

templateRouter.post("/create", authMiddleware(), async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.CONNECTION_POOL_URL
    }).$extends(withAccelerate());

    const userId = c.get("userId");

    if (!userId) {
        return c.json({ message: "User not logged in" }, 401);
    }

    try {

        // Step 1: find the user
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        // Step 2: allow only specific email
        if (user?.email !== "rick01.lm10@gmail.com") {
            return c.json({ message: "Not allowed to create templates" }, 403);
        }

        const body = await c.req.json();

        const { title, description, category, workflowId } = body;

        // Step 3: convert existing workflow → template
        const template = await prisma.templateMeta.create({
            data: {
                title,
                description,
                workflowId
            }
        });

        await prisma.workflow.update({
            where: { id: workflowId },
            data: {
                isTemplate: true,
                userId: null
            }
        });

        return c.json({
            ok: true,
            template
        });

    } catch (error) {
        console.error(error);
        return c.json({ ok: false, message: "Error creating template" }, 500);
    }
});