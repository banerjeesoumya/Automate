import { NonRetryableError } from "cloudflare:workflows";
import { NodeExecutor, WorkflowContext } from "../lib/types";
import { createAnthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { PrismaClient } from "../../generated/prisma/edge";

/**
 * Resolve a value from an object using dot-notation
 * Example: getByPath(ctx, "todo.httpRequestResponse.data.userId")
 */
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


/**
 * Safe interpolation for Cloudflare Workers
 * Replaces {{path.to.value}} with resolved values from context
 */
function interpolate(
  template: string,
  context: Record<string, unknown>
): string {
  return template.replace(/\{\{\s*([^}]+)\s*\}\}/g, (_, expr) => {
    const trimmed = expr.trim();

    // ✅ JSON directive
    if (trimmed.startsWith("json ")) {
      const path = trimmed.slice(5).trim();
      const value = getByPath(context, path);

      if (value === undefined) {
        throw new Error(`Unable to resolve template value: ${expr}`);
      }

      return JSON.stringify(value);
    }

    // ✅ Normal path resolution (NO encoding)
    const value = getByPath(context, trimmed);

    if (value === undefined || value === null) {
      throw new Error(`Unable to resolve template value: ${expr}`);
    }

    return String(value);
  });
}


type AnthropicData = {
  variableName?: string;
  credentialId?: string;
  model?: string;
  systemPrompt?: string;
  userPrompt?: string;
};

export const anthropicExecutor: NodeExecutor<AnthropicData> = async ({
  data,
  nodeId,
  context,
  step,
  env
}) => {
  if (!data.variableName) {
    throw new NonRetryableError(`Anthropic node ${nodeId} is missing variableName`);
  }

  if (!data.userPrompt) {
    throw new NonRetryableError(`Anthropic node ${nodeId} is missing userPrompt`);
  }

  const variableName = data.variableName; // ✅ FIX #2

  const prisma = new PrismaClient({
    datasourceUrl: env.CONNECTION_POOL_URL || "",
  })

  const credential = await prisma.credential.findUnique({
    where: {
      id: data.credentialId
    }
  })

  if (!credential) {
    throw new NonRetryableError('Gemini credential not found');
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

  const anthropic = createAnthropic({
    apiKey: credential.value,
  });

  // @ts-ignore
  const result = await step.do(`anthropic-generate-text-${nodeId}`, async () => {
    try {
      const { text } = await generateText({
        model: anthropic("claude-sonnet-4-5"),
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
      throw new NonRetryableError(`Anthropic node failed: ${(error as Error).message}`);
    }
  });

  return result as WorkflowContext;
};