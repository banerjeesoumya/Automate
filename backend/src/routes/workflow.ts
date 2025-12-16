import { Hono } from 'hono';
import { Env } from '../types/env';
import { generateSlug } from 'random-word-slugs';
import { authMiddleware } from '../utils/authMiddleware';
import { NodeType, PrismaClient } from '../generated/prisma/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import z from 'zod';
import { PAGINATION } from '../utils/constants';
import type { Node } from '@xyflow/react';  
import { id } from 'zod/v4/locales';

export const workflowRouter = new Hono<{
    Bindings: Env,
    Variables: {
        userId?: string
    }
}>();


workflowRouter.post('/create', authMiddleware(), async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.CONNECTION_POOL_URL
    }).$extends(withAccelerate());
    const userId = c.get('userId');
    console.log('Creating workflow for user:', userId);
    if (!userId) {
        return c.json({ message: 'User not logged in' }, 401);
    }
    try {
        // Step 1: Create a new workflow.
        const creatWorkflow = await prisma.workflow.create({
            data: {
                name: generateSlug(2),
                userId: userId,
                // Step 2: Create the initial node for the workflow
                nodes: {
                    create: {
                        type: NodeType.Initial,
                        name: NodeType.Initial,
                        position: { x: 0, y: 0 },
                        data: {},
                    }
                }
            }
        })
        return c.json({
            ok: true,
            workflow: creatWorkflow,
        });
    } catch (error) {
        console.error('Error creating workflow:', error);
        return c.json({
            ok: false,
            message: 'Error creating workflow',
        }, 500);
    }
})

const getOneWorkflowSchema = z.object({
    id: z.string()
})

const getAllWorkflowsSchema = z.object({
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
});

workflowRouter.get("/all", authMiddleware(), async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.CONNECTION_POOL_URL,
  }).$extends(withAccelerate());

  const userId = c.get("userId");
  console.log("Fetching workflows for user:", userId);
  if (!userId) {
    return c.json({ message: "User not logged in" }, 401);
  }

  // ✅ Extract query params safely
  const url = new URL(c.req.url);
  const queryParams = Object.fromEntries(url.searchParams.entries());

  // ✅ Validate and parse using Zod
  const parseResult = getAllWorkflowsSchema.safeParse(queryParams);
  if (!parseResult.success) {
    return c.json({ message: "Invalid request", errors: parseResult.error.errors }, 400);
  }

  const { page, pageSize, search } = parseResult.data;

  try {
    const [items, totalCount] = await Promise.all([
      prisma.workflow.findMany({
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
      prisma.workflow.count({
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
      message: "Workflows fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching workflows:", error);
    return c.json({ ok: false, message: "Error fetching workflows" }, 500);
  }
});

workflowRouter.get('/get/:id', authMiddleware(), async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.CONNECTION_POOL_URL
    }).$extends(withAccelerate());
    const userId = c.get('userId');
    const parseResult = getOneWorkflowSchema.safeParse({
        id: c.req.param('id')
    });
    if (!parseResult.success) {
        return c.json({ message: 'Invalid request', errors: parseResult.error.errors }, 400);
    }
    console.log('Fetching workflows for user:', userId);
    if (!userId) {
        return c.json({ message: 'User not logged in' }, 401);
    }
    try {
        const workflow = await prisma.workflow.findUniqueOrThrow({
            where: {
                id: parseResult.data.id,
                userId: userId
            },
            include: {
                nodes: true,
                connections: true,
            }
        })
        const nodes: Node[] = workflow.nodes.map((node) => ({
            id: node.id,
            type: node.type,
            position: node.position as { x: number; y: number },
            data: (node.data as Record<string, unknown>) || {},
        }))

        const edges = workflow.connections.map((conn) => ({
            id: conn.id,
            source: conn.fromNodeId,
            target: conn.toNodeId,
            sourceHandle: conn.fromOutput,
            targetHandle: conn.toInput
        }))

        return c.json({
            ok: true,
            id: workflow.id,
            name: workflow.name,
            nodes,
            edges,
            message: 'Workflow fetched successfully',
        })
    } catch (error) {
        console.error('Error fetching workflows:', error);
        return c.json({
            ok: false,
            message: 'Error fetching workflows',
        }, 500);
    }
})

workflowRouter.patch('/update/:id', authMiddleware(), async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.CONNECTION_POOL_URL
    }).$extends(withAccelerate());
    const userId = c.get('userId');
    if (!userId) {
        return c.json({ message: 'User not logged in' }, 401);
    }
    const workflowId = c.req.param('id');
    if (!workflowId) {
        return c.json({ error: 'Workflow ID is required' }, 400);
    }
    const body = await c.req.json<{ name?: string }>();
    try {
        const updateWorkflowName = await prisma.workflow.update({
            where: {
                id: workflowId,
                userId: userId,
            },
            data: {
                name: body.name,
            }
        })
        return c.json({
            ok: true,
            workflow: updateWorkflowName,
        })
    } catch (error) {
        console.error('Error updating workflow:', error);
        return c.json({
            ok: false,
            message: 'Error updating workflow',
        }, 500);
    }
})  

const deleteWorkflowSchema = z.object({
    id: z.string()
});

workflowRouter.delete('/delete/:id', authMiddleware(), async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.CONNECTION_POOL_URL
    }).$extends(withAccelerate());
    const userId = c.get('userId');
    if (!userId) {
        return c.json({ message: 'User not logged in' }, 401);
    }
    const workflowId = c.req.param('id');
    const parseResult = deleteWorkflowSchema.safeParse({
        id: workflowId
    });
    if (!parseResult.success) {
        return c.json({ message: 'Invalid request', errors: parseResult.error.errors }, 400);
    }
    if (!workflowId) {
        return c.json({ error: 'Workflow ID is required' }, 400);
    }
    try {
      const deleteWorkflow = await prisma.workflow.delete({
        where: {
          id: workflowId,
          userId: userId,
        }
      })
      return c.json({
        ok: true,
        workflow: deleteWorkflow,
        message: 'Workflow deleted successfully',
      })
    } catch (error) {
      console.error('Error deleting workflow:', error);
      return c.json({
        ok: false,
        message: 'Error deleting workflow',
      }, 500);
    }
})

const updateWorkflowSchema = z.object({
    // id: z.string(),
    nodes: z.array(
        z.object({
            id: z.string(),
            type: z.string().nullish(),
            position: z.object({
                x: z.number(),
                y: z.number()
            }),
            data: z.record(z.string(), z.any()).optional()
        })
    ),
    edges: z.array(
        z.object({
            source: z.string(),
            target: z.string(),
            sourceHandle: z.string().nullish(),
            targetHandle: z.string().nullish(),
        })
    )
})

workflowRouter.put('/update/:id/nodes', authMiddleware(), async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.CONNECTION_POOL_URL
    }).$extends(withAccelerate());
    const userId = c.get('userId');
    if (!userId) {
        return c.json({ message: 'User not logged in' }, 401);
    }
    const workflowId = c.req.param('id');
    if (!workflowId) {
        return c.json({ error: 'Workflow ID is required' }, 400);
    }

    const body = await c.req.json();
    const correctUpdateBody = updateWorkflowSchema.safeParse(body);
    if (!correctUpdateBody.success) {
        return c.json({ error: 'Invalid request body', details: correctUpdateBody.error.errors }, 400);
    }

    try {
        const { nodes, edges } = correctUpdateBody.data;
        // Step 1: Find the workflow to ensure it exists and belongs to the user
        const existingWorkflow = await prisma.workflow.findFirst({
            where: {
                id: workflowId,
                userId: userId,
            }
        });
        if (!existingWorkflow) {
            return c.json({ error: 'Workflow not found' }, 404);
        }
        // Updates the nodes and the edges associated with the workflow. Keeping it inside a transaction to ensure data consistency.
        const updatedNodes = await prisma.$transaction(async (tx) => {
            // Step 2: Delete existing nodes and connections
            await tx.node.deleteMany({
                where: {
                    workflowId: existingWorkflow.id,
                }
            });
            await tx.connection.deleteMany({
                where: {
                    workflowId: existingWorkflow.id,
                }
            })
            // Step 3: Create New Nodes and Connections
             await tx.node.createMany({
                data: nodes.map((node) => ({
                    id: node.id,
                    workflowId: workflowId,
                    name: node.type || "Unnamed Node",
                    type: node.type as NodeType,
                    position: node.position,
                    data: node.data || {}
                }))
            })
            await tx.connection.createMany({
                data: edges.map((edge) => ({
                    workflowId: workflowId,
                    fromNodeId: edge.source,
                    toNodeId: edge.target,
                    fromOutput: edge.sourceHandle || "main",
                    toInput: edge.targetHandle || "main"
                }))
            })
            await tx.workflow.update({
                where: {
                    id: workflowId
                },
                data: {
                    updatedAt: new Date()
                }
            })
        })
        return c.json({
            ok: true,
            message: 'Workflow nodes and edges updated successfully',
            nodes: updatedNodes,
        })
    } catch (error) {
        console.error('Error updating workflow nodes and edges:', error);
        return c.json({
            ok: false,
            message: 'Error updating workflow nodes and edges',
        }, 500);
    }
})