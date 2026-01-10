import { WorkflowEntrypoint, WorkflowEvent, WorkflowStep } from "cloudflare:workers";
import { Env } from "../types/env";
import { NonRetryableError } from "cloudflare:workflows";
import { getDB } from "../db/client";
import { ExecutionStatus, NodeType } from "../generated/prisma";
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
    const { workflowId, initialData } = event.payload;

    // 1. Checks for required workflowId
    if (!workflowId) {
      throw new NonRetryableError("workflowId is required");
    }

    const db = getDB(this.env)

    // 2. Get's the instance ID
    const instanceId = event.instanceId;
    if (!instanceId) {
      throw new NonRetryableError("Instance ID is required");
    }

    try {
      
      // 3. Get the execution ID corresponding to this instance
      const executionId = await step.do("get-execution-id", async () => {
        const execution = await db.execution.findUniqueOrThrow({
          where: {
            cloudflareWorkflowId: instanceId,
            workflowId: workflowId,
          }
        });
        return execution.id;
      });


      const doId = this.env.EXECUTION_STATE.idFromName(executionId);
      const executionStateDO = this.env.EXECUTION_STATE.get(doId);
      
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

      // 5. Initialize the context of each node with initialData from the trigger 
      let context = initialData || {};

      // 6. Execute each node in the sorted order
      for (const node of sortedNodes) {
        try {
          // 6.1 Update the execution state
          await executionStateDO.fetch("https://do/update", {
            method: "POST",
            body: JSON.stringify({
              executionId,
              nodeId: node.id,
              status: "RUNNING"
            }),
          });

          // sleep for visual feedback
          await step.sleep(`delay-running-${node.id}`, 1000);
          const executor = getExecutor(node.type as NodeType)

          context = await executor({
            data: node.data as Record<string, unknown>,
            nodeId: node.id,
            context,
            step,
            env: this.env
          });
          
          // 6.2 Update the execution state to completed
          await executionStateDO.fetch("https://do/update", {
            method: "POST",
            body: JSON.stringify({
              executionId,
              nodeId: node.id,
              status: "COMPLETE"
            }),
          });

          // sleep for visual feedback
          await step.sleep(`delay-complete-${node.id}`, 1000);
        } catch (error: any) {
          // 6.3 Update the execution state to errored
          await executionStateDO.fetch("https://do/update", {
            method: "POST",
            body: JSON.stringify({
              executionId,
              nodeId: node.id,
              status: "ERRORED",
              error: error.message
            }),
          });
          throw error;
        }
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
      throw error;
    }
  }
}