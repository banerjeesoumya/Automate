import { NonRetryableError } from "cloudflare:workflows";
import { NodeExecutor, WorkflowContext } from "../lib/types";
import ky, { Options as KyOptions } from "ky";

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



type HTTP_RequestData = {
  variableName?: string;
  endpoint?: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: string;
};

export const httpRequestExecutor: NodeExecutor<HTTP_RequestData> = async ({
  data,
  nodeId,
  context,
  step,
}) => {
  // @ts-ignore
  const result = await step.do(`http-request-${nodeId}`, async () => {
    try {
      if (!data.variableName) {
        throw new NonRetryableError(
          `HTTP Request node ${nodeId} is missing variableName`
        );
      }

      if (!data.endpoint) {
        throw new NonRetryableError(
          `HTTP Request node ${nodeId} is missing endpoint`
        );
      }

      if (!data.method) {
        throw new NonRetryableError(
          `HTTP Request node ${nodeId} is missing method`
        );
      }

      let endpoint: string;
      let body: string | undefined;

      try {
        endpoint = interpolate(data.endpoint, context);
        console.log("Interpolated Endpoint: ", endpoint);
        body = data.body ? interpolate(data.body, context) : undefined;
        console.log("Interpolated Body: ", body);
      } catch (err) {
        throw new NonRetryableError(
          `Template error in node ${nodeId}: ${(err as Error).message}`
        );
      }

      const options: KyOptions = {
        method: data.method,
      };

      if (["POST", "PUT", "PATCH"].includes(data.method)) {
        if (body) {
          // validate JSON
          JSON.parse(body);
          options.body = body;
          options.headers = {
            "Content-Type": "application/json",
          };
        }
      }

      const response = await ky(endpoint, options);
      const contentType = response.headers.get("content-type");

      const responseData = contentType?.includes("application/json")
        ? await response.json()
        : await response.text();

      return {
        ...context,
        [data.variableName]: {
          httpRequestResponse: {
            status: response.status,
            statusText: response.statusText,
            data: responseData,
          },
        },
      };
    } catch (err) {
      // TODO: will add piece of code that would avoid double-wrapping NonRetryableError in the future
      throw new NonRetryableError(
        `HTTP Request node failed: ${(err as Error).message}`
      );
    }
  });

  // collapse Cloudflare boundary
  return result as WorkflowContext;
};
