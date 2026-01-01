import { NonRetryableError } from "cloudflare:workflows";
import { NodeExecutor, WorkflowContext } from "../lib/types";
import { decode } from "html-entities"
import ky from "ky";

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

type SlackData = {
  variableName?: string;
  webhookUrl?: string;
  content?: string;
};

export const slackExecutor: NodeExecutor<SlackData> = async ({
  data,
  nodeId,
  context,
  step,
  env
}) => {
  // @ts-ignore
  const result = await step.do(`slack-generate-text-${nodeId}`, async () => {
    try {
      if (!data.variableName) {
        throw new NonRetryableError(`Slack node ${nodeId} is missing variableName`);
      }

      if (!data.content) {
        throw new NonRetryableError(`Slack node ${nodeId} is missing content`);
      }

      const variableName = data.variableName;

      let rawContent: string;
      let content: string;

      try {
        rawContent = interpolate(
          data.content || "",
          context
        );
      } catch (err) {
        throw new NonRetryableError(
          `Template error in node ${nodeId}: ${(err as Error).message}`
        );
      }

      content = decode(rawContent);
      if (!data.webhookUrl) {
        throw new NonRetryableError(`Slack node ${nodeId} is missing webhookUrl`);
      }
      
      await ky.post(data.webhookUrl, {
        json: {
          content: content.slice(0, 2000),
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
        `Slack node failed: ${(err as Error).message}`
      );
    }
  });

  return result as WorkflowContext;
};