import { Hono } from "hono";
import { Env } from "../types/env";
import z from "zod";
import { PrismaClient } from "../generated/prisma/edge";
import { withAccelerate } from "@prisma/extension-accelerate";

export const webhookRouter = new Hono<{
    Bindings: Env;
    Variables: {
        userId?: string;
        workflowId?: string;
    }
}>();

const  googleFormWebhookSchema = z.object({
    workflowId: z.string()
})

webhookRouter.post("/google-form", async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.CONNECTION_POOL_URL
    }).$extends(withAccelerate())
    console.log("Received Google Form webhook");
    // if (!userId) {
    //     return c.json({ ok: false, message: "Unauthorized" }, 401);
    // }
    
    const url = new URL(c.req.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());

    const parseResult = googleFormWebhookSchema.safeParse(queryParams);

    if (!parseResult.success) {
        return c.json({ ok: false, message: "Invalid query parameters", errors: parseResult.error.errors }, 400);
    }

    const { workflowId } = parseResult.data;

    if (!workflowId) {
        return c.json({ ok: false, message: "Missing workflowId" }, 400);
    }

    const workflow = await prisma.workflow.findUnique({
        where: {
            id: workflowId
        }
    })

    const userId = workflow?.userId as string
    

    const body = await c.req.json();

    const formData = {
        formId: body.formId,
        formTitle: body.formTitle,
        responseId: body.responseId,
        timeStamp: body.timestamp,
        respondentEmail: body.respondentEmail,
        responses: body.responses,
        raw: body
    };

    try {
        const execution = await c.env.MY_WORKFLOW.create({
            params: {
                email: userId,
                id: "execute-workflow",
                eventName: "workflows/execute.workflow",
                workflowId: workflowId,
                initialData: {
                    googleForm: formData
                }
            }
        })
        console.log("Initial data sent to workflow:", formData)
        return c.json({
            ok: true,
            message: "Google Form webhook received and workflow execution started",
            execution            
        })
    } catch (error) {
        console.error("Error processing Google Form webhook:", error);
        return c.json({ ok: false, message: "Internal server error" }, 500);
    }
})