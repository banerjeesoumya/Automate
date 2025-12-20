import { WorkflowEntrypoint, WorkflowEvent, WorkflowStep } from "cloudflare:workers";
import { Env } from "../types/env";
import { NonRetryableError } from "cloudflare:workflows";
import { getDB } from "../db/client";
import { NodeType, PrismaClient } from "../generated/prisma";
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

    if (!workflowId) {
      throw new NonRetryableError("workflowId is required");
    }

    const db = getDB(this.env)

    const sortedNodes = await step.do("prepare-workflow", async () => {
      const workflow = await db.workflow.findUniqueOrThrow({
        where: {
          id: workflowId
        }, include: {
          nodes: true,
          connections: true
        }
      })

      return topologicalSort(workflow.nodes, workflow.connections);
    })
    
    // Initialize the context of each node with initialData from the trigger 

    let context = initialData || {};
    
    for (const node of sortedNodes) {
      const executor = getExecutor(node.type as NodeType)
      context = await executor({
        data: node.data as Record<string, unknown>,
        nodeId: node.id,
        context,
        step
      })
    }

    console.log("Workflow Id: ", workflowId);
    console.log("Final Context: ", context);
    console.log("Nodes Executed: ", sortedNodes.map(n => n.name));

    return { 
      success: true, 
      workflowId: workflowId,
      result: context 
    };
  }
}
