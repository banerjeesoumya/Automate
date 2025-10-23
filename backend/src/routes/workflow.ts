import { Hono } from 'hono';
import { Env } from '../types/env';
import { generateSlug } from 'random-word-slugs';
import { createId } from '@paralleldrive/cuid2';
import { authMiddleware } from '../utils/authMiddleware';
import { NodeType, PrismaClient } from '../generated/prisma/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import z from 'zod';

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
 
workflowRouter.get('/workflows/all', authMiddleware(), async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.CONNECTION_POOL_URL
    }).$extends(withAccelerate());
    const userId = c.get('userId');
    // console.log("Hello from workflows/all endpoint");
    if (!userId) {
        return c.json({ message: 'User not logged in' }, 401);
    }
    try {
        const workflows = await prisma.workflow.findMany({
            where: {
                userId: userId
            },
            orderBy: {
                createdAt: 'desc'
            }
        })
        console.log(workflows)
        return c.json({
            ok: true,
            workflows: workflows,
            message: 'Workflows fetched successfully',
        })
    } catch (error) {
        console.error('Error fetching workflows:', error);
        return c.json({
            ok: false,
            message: 'Error fetching workflows',
        }, 500);
    }
})

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