import { NodeType } from "../../generated/prisma";
import { httpRequestExecutor } from "../executors/httpRequest";
import { manualTriggerExecutor } from "../executors/manualTrigger";
import { NodeExecutor } from "./types";

export const executorRegistry: Record<NodeType, NodeExecutor> = {
    [NodeType.Manual_Trigger]: manualTriggerExecutor,
    [NodeType.Initial]: manualTriggerExecutor,
    [NodeType.HTTP_Request]: httpRequestExecutor,
    [NodeType.GEMINI]: manualTriggerExecutor,
    [NodeType.OPEN_AI]: manualTriggerExecutor,
    [NodeType.ANTHROPIC]: manualTriggerExecutor,
}

export const getExecutor = (type: NodeType): NodeExecutor => {
    const executor = executorRegistry[type];
    if (!executor) {
        throw new Error(`No executor found for node type: ${type}`);
    }

    return executor;
}