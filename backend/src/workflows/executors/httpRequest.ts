import { NonRetryableError } from "cloudflare:workflows";
import { NodeExecutor, WorkflowContext } from "../lib/types";
import ky, {Options as KyOptions} from "ky"

type HTTP_RequestData = {
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
  const result = await step.do(`http-request-${nodeId}`,async () => {
    if (!data.endpoint) {
      throw new NonRetryableError(`HTTP Request node ${nodeId} is missing endpoint`);
    }
    
    const endpoint = data.endpoint;
    const method = data.method || "GET";

    const options : KyOptions = {
      method,
    };

    if (["POST", "PUT", "PATCH"].includes(method)) {
      options.body = data.body || "";
      options.headers = {
        "Content-Type": "application/json",
      };
    }
    
    const response = await ky(data.endpoint, options)
    const contentType = response.headers.get("content-type");
    const responseData = contentType?.includes("application/json") ? await response.json() : await response.text(); 


    return {
      ...context,
      httpRequestResponse: {
        status: response.status,
        statusText: response.statusText,
        data: responseData,
      }
    }
  });

  // ✅ collapse Cloudflare boundary here
  return result as WorkflowContext;
};
