import { NonRetryableError } from "cloudflare:workflows";
import { NodeExecutor, WorkflowContext } from "../lib/types";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { decode } from "html-entities"
import { PrismaClient } from "../../generated/prisma/edge";
import ky from "ky";

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

type DiscordData = {
  variableName?: string;
  webhookUrl?: string;
  username?: string;
  content?: string;
};

export const discordExecutor: NodeExecutor<DiscordData> = async ({
  data,
  nodeId,
  context,
  step,
  env
}) => {
  // @ts-ignore
  const result = await step.do(`discord-generate-text-${nodeId}`, async () => {
    try {
      if (!data.variableName) {
        throw new NonRetryableError(`Discord node ${nodeId} is missing variableName`);
      }

      if (!data.content) {
        throw new NonRetryableError(`Discord node ${nodeId} is missing content`);
      }

      const variableName = data.variableName; 

      let rawContent: string;
      let username: string | undefined;
      let content: string;

      try {
        rawContent = interpolate(
          data.content || "",
          context
        );
        username = data.username ? decode(interpolate(data.username, context)) : undefined;
      } catch (err) {
        throw new NonRetryableError(
          `Template error in node ${nodeId}: ${(err as Error).message}`
        );
      }

      content = decode(rawContent);
      if (!data.webhookUrl) {
        throw new NonRetryableError(`Discord node ${nodeId} is missing webhookUrl`);
      }
      
      await ky.post(data.webhookUrl, {
        json: {
          content: content.slice(0, 2000), // Discord message limit
          username: username,
        }
      });
      

      return {
        ...context,
        [variableName]: {
          messageContent: content.slice(0, 2000),
        },
      };
    } catch (err) {
      throw new NonRetryableError(
        `Discord node failed: ${(err as Error).message}`
      );
    }
  });

  return result as WorkflowContext;
};