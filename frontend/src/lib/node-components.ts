import { InitialNode } from "@/components/initial-node";
import { AnthropicNode } from "@/features/executions/components/anthropic/node";
import { GeminiNode } from "@/features/executions/components/gemini/node";
import { HTTPRequestNode } from "@/features/executions/components/http-requests/node";
import { OpenAINode } from "@/features/executions/components/openai/node";
import { GoogleFormTriggerNode } from "@/features/triggers/components/google-form-trigger/node";
import { ManualTriggerNode } from "@/features/triggers/components/manual-trigger/node";
// import { HTTPRequestNode } from "@/features/executions/components/http-requests/node";
// import { ManualTriggerNode } from "@/features/triggers/components/manual-trigger/node";
import { NodeType } from "@/lib/utils";
import { NodeTypes } from "@xyflow/react";

export const nodeComponents = {
    [NodeType.Initial]: InitialNode,
    [NodeType.Manual_Trigger]: ManualTriggerNode,
    [NodeType.HTTP_Request]: HTTPRequestNode,
    [NodeType.GOOGLE_FORM_TRIGGER]: GoogleFormTriggerNode,
    [NodeType.GEMINI]: GeminiNode,
    [NodeType.OPEN_AI]: OpenAINode,
    [NodeType.ANTHROPIC]: AnthropicNode,
} as const satisfies NodeTypes;

export type RegisteredNodeType = keyof typeof nodeComponents;