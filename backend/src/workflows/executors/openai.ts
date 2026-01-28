import { NonRetryableError } from "cloudflare:workflows";
import { NodeExecutor, WorkflowContext } from "../lib/types";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { PrismaClient } from "@repo/db/edge";

function getByPath(
  obj: Record<string, unknown>,
  path: string
): unknown {
  let current: unknown = obj;

  for (const key of path.split(".")) {
    if (current && typeof current === "object") {
      current = (current as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }

  return current;
}


function interpolate(
  template: string,
  context: Record<string, unknown>
): string {
  return template.replace(/\{\{\s*([^}]+)\s*\}\}/g, (_, expr) => {
    const trimmed = expr.trim();

    if (trimmed.startsWith("json ")) {
      const path = trimmed.slice(5).trim();
      const value = getByPath(context, path);

      if (value === undefined) {
        throw new Error(`Unable to resolve template value: ${expr}`);
      }

      return JSON.stringify(value);
    }

    const value = getByPath(context, trimmed);

    if (value === undefined || value === null) {
      throw new Error(`Unable to resolve template value: ${expr}`);
    }

    return String(value);
  });
}


type OpenAIData = {
  variableName?: string;
  credentialId?: string;
  model?: string;
  systemPrompt?: string;
  userPrompt?: string;
};

export const openAIExecutor: NodeExecutor<OpenAIData> = async ({
  data,
  nodeId,
  context,
  step,
  env
}) => {
  if (!data.variableName) {
    throw new NonRetryableError(`OpenAI node ${nodeId} is missing variableName`);
  }

  if (!data.userPrompt) {
    throw new NonRetryableError(`OpenAI node ${nodeId} is missing userPrompt`);
  }

  const variableName = data.variableName;

  const prisma = new PrismaClient({
      datasourceUrl: env.CONNECTION_POOL_URL || "",
    })
  
    const credential = await prisma.credential.findUnique({
      where: {
        id: data.credentialId
      }
    })
  
    if (!credential) {
      throw new NonRetryableError('OpenAI credential not found');
    }

  let systemPrompt: string;
  let userPrompt: string;

  try {
    systemPrompt = interpolate(
      data.systemPrompt || "You are a helpful assistant.",
      context
    );
    userPrompt = interpolate(data.userPrompt, context);
  } catch (err) {
    throw new NonRetryableError(
      `Template error in node ${nodeId}: ${(err as Error).message}`
    );
  }

  const openai = createOpenAI({
    apiKey: credential.value,
  })

  // @ts-ignore
  const result = await step.do(`openai-generate-text-${nodeId}`, async () => {
    try {
      const { text } = await generateText({
        model: openai("gpt-4"),
        system: systemPrompt,
        prompt: userPrompt,
      });

      return {
        ...context,
        [variableName]: {
          aiResponse: text,
        },
      };
    } catch (error) {
      throw new NonRetryableError(`OpenAI node failed: ${(error as Error).message}`);
    }
   });

  return result as WorkflowContext;
};