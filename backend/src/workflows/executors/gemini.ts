import { NonRetryableError } from "cloudflare:workflows";
import { NodeExecutor, WorkflowContext } from "../lib/types";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
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


type GeminiData = {
  variableName?: string;
  model?: string;
  systemPrompt?: string;
  userPrompt?: string;
};

export const geminiExecutor: NodeExecutor<GeminiData> = async ({
  data,
  nodeId,
  context,
  step,
}) => {
  if (!data.variableName) {
    throw new NonRetryableError(`Gemini node ${nodeId} is missing variableName`);
  }

  if (!data.userPrompt) {
    throw new NonRetryableError(`Gemini node ${nodeId} is missing userPrompt`);
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

  const google = createGoogleGenerativeAI({
    apiKey: ""
  });

  // @ts-ignore
  const result = await step.do(`gemini-generate-text-${nodeId}`, async () => {
    const { text } = await generateText({
      model: google("gemini-2.5-flash-lite"), // ✅ FIX #1
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