import { InitialNode } from "@/components/initial-node";
import { HTTPRequestNode } from "@/features/executions/components/http-requests/node";
import { ManualTriggerNode } from "@/features/triggers/components/manual-trigger/node";
// import { HTTPRequestNode } from "@/features/executions/components/http-requests/node";
// import { ManualTriggerNode } from "@/features/triggers/components/manual-trigger/node";
import { NodeType } from "@/lib/utils";
import { NodeTypes } from "@xyflow/react";

export const nodeComponents = {
    [NodeType.Initial]: InitialNode,
    [NodeType.Manual_Trigger]: ManualTriggerNode,
    [NodeType.HTTP_Request]: HTTPRequestNode,
} as const satisfies NodeTypes;

export type RegisteredNodeType = keyof typeof nodeComponents;