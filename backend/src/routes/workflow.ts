import { Hono } from 'hono';
import { Env } from '../types/env';
import { generateSlug } from 'random-word-slugs';
import { createId } from '@paralleldrive/cuid2';
import { authMiddleware } from '../utils/authMiddleware';
import { NodeType, PrismaClient } from '../generated/prisma/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import z from 'zod';
import { PAGINATION } from '../utils/constants';

export const workflowRouter = new Hono<{
    Bindings: Env,
    Variables: {
        userId?: string
    }
}>();


workflowRouter.post('/workflows', authMiddleware(), async (c) => {
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

workflowRouter.get("/workflows/all", authMiddleware(), async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.CONNECTION_POOL_URL,
  }).$extends(withAccelerate());

  const userId = c.get("userId");
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

workflowRouter.get('/workflows/:id', authMiddleware(), async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.CONNECTION_POOL_URL
    }).$extends(withAccelerate());
    const userId = c.get('userId');
    // const body = await c.req.json();
    // const parseResult = getOneWorkflowSchema.safeParse(body);
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
        const workflow = await prisma.workflow.findUnique({
            where: {
                id: parseResult.data.id,
                userId: userId
            },
        })
        return c.json({
            ok: true,
            workflow: workflow,
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

workflowRouter.patch('/workfllows/:id', authMiddleware(), async (c) => {
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