import { NodeType } from "../../generated/prisma";
import { anthropicExecutor } from "../executors/anthropic";
import { discordExecutor } from "../executors/discord";
import { geminiExecutor } from "../executors/gemini";
import { googleFormTriggerExecutor } from "../executors/googleFormTrigger";
import { httpRequestExecutor } from "../executors/httpRequest";
import { manualTriggerExecutor } from "../executors/manualTrigger";
import { openAIExecutor } from "../executors/openai";
import { slackExecutor } from "../executors/slack";
import { NodeExecutor } from "./types";

export const executorRegistry: Record<NodeType, NodeExecutor> = {
    [NodeType.Manual_Trigger]: manualTriggerExecutor,
    [NodeType.Initial]: manualTriggerExecutor,
    [NodeType.HTTP_Request]: httpRequestExecutor,
    [NodeType.GOOGLE_FORM_TRIGGER]: googleFormTriggerExecutor,
    [NodeType.GEMINI]: geminiExecutor,
    [NodeType.OPEN_AI]: openAIExecutor,
    [NodeType.ANTHROPIC]: anthropicExecutor,
    [NodeType.DISCORD]: discordExecutor,
    [NodeType.SLACK]: slackExecutor
}

export const getExecutor = (type: NodeType): NodeExecutor => {
    const executor = executorRegistry[type];
    if (!executor) {
        throw new Error(`No executor found for node type: ${type}`);
    }

    return executor;
}