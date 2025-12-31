import { WorkflowEntrypoint, WorkflowEvent, WorkflowStep } from "cloudflare:workers";
import { Env } from "../types/env";
import { NonRetryableError } from "cloudflare:workflows";
import { getDB } from "../db/client";
import { ExecutionStatus, NodeType, PrismaClient } from "../generated/prisma";
import { topologicalSort } from "../utils/topoSort";
import { getExecutor } from "./lib/executor-registry";


type Params = {
    email: string;
    id: "execute-workflow";
    eventName: "workflows/execute.workflow";
    workflowId?: string;
    initialData?: {};
};

export class MyWorkflow extends WorkflowEntrypoint<Env, Params> {
  async run(event: WorkflowEvent<Params>, step: WorkflowStep) {

    // ✅ Access workflow input using event.payload
    const { email, id, eventName, workflowId, initialData } = event.payload;

    // 1. Checks for required workflowId
    if (!workflowId) {
      throw new NonRetryableError("workflowId is required");
    }

    const db = getDB(this.env)
    // 2. Get's the instance ID
    const instanceId = event.instanceId;
    console.log(`Starting workflow execution. Instance ID: ${instanceId}, Workflow ID: ${workflowId}`);
    if (!instanceId) {
      throw new NonRetryableError("Instance ID is required");
    }

    try {
    // 3. Create the execution record in the database

      await step.do("create-execution", async () => {
        return db.execution.create({
          data: {
            workflowId: workflowId,
            cloudflareWorkflowId: instanceId,
          }
        })
      })

    // 4. Prepare the workflow by topologically sorting the nodes 
      const sortedNodes = await step.do("prepare-workflow", async () => {
        const workflow = await db.workflow.findUniqueOrThrow({
          where: {
            id: workflowId
          }, include: {
            nodes: true,
            connections: true,
          }
        })

        return topologicalSort(workflow.nodes, workflow.connections);
      })
      
      //5.  Initialize the context of each node with initialData from the trigger 
      let context = initialData || {};
      
      // 6. Execute each node in the sorted order
      for (const node of sortedNodes) {
        const executor = getExecutor(node.type as NodeType)
        context = await executor({
          data: node.data as Record<string, unknown>,
          nodeId: node.id,
          context,
          step,
          env: this.env
        })
      }

      // 7. Update the execution record in the database
      await step.do("update-execution", async () => {
        return db.execution.update({
          where: {
            cloudflareWorkflowId: instanceId,
            workflowId: workflowId,
          },
          data: {
            status: ExecutionStatus.COMPLETE,
            completedAt: new Date(),
            logs: context
          }
        })
      })

      console.log("Workflow Id: ", workflowId);
      console.log("Final Context: ", context);
      console.log("Nodes Executed: ", sortedNodes.map(n => n.name));

      return { 
        success: true, 
        workflowId: workflowId,
        result: context 
      };
    } catch (error: any) {
      // 8. Update the execution record to failed
      await step.do("update-execution-failed", async () => {
        return db.execution.update({
          where: {
            cloudflareWorkflowId: instanceId,
            workflowId: workflowId,
          },
          data: {
            status: ExecutionStatus.ERRORED,
            error: error.message,
            errorStack: error.stack
          }
        })
      })
      console.log("Error name: ", error.name);
      console.log("Error stack: ", error.stack);
      console.log("Error message: ", error.message);
      throw error;
    }
  }
}