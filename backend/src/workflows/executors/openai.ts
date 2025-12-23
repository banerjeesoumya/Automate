import { NonRetryableError } from "cloudflare:workflows";
import { NodeExecutor, WorkflowContext } from "../lib/types";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";

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


type OpenAIData = {
  variableName?: string;
  model?: string;
  systemPrompt?: string;
  userPrompt?: string;
};

export const openAIExecutor: NodeExecutor<OpenAIData> = async ({
  data,
  nodeId,
  context,
  step,
}) => {
  if (!data.variableName) {
    throw new NonRetryableError(`OpenAI node ${nodeId} is missing variableName`);
  }

  if (!data.userPrompt) {
    throw new NonRetryableError(`OpenAI node ${nodeId} is missing userPrompt`);
  }

  const variableName = data.variableName; // ✅ FIX #2

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
    apiKey: "${OPENAI_API_KEY}",
  })

  // @ts-ignore
  const result = await step.do(`openai-generate-text-${nodeId}`, async () => {
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
  });

  return result as WorkflowContext;
};