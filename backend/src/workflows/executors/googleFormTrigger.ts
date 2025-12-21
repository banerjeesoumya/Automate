import { NodeExecutor, WorkflowContext } from "../lib/types";

type GoogleFormTriggerData = Record<string, unknown>;

export const googleFormTriggerExecutor: NodeExecutor<GoogleFormTriggerData> = async ({
  data,
  nodeId,
  context,
  step,
}) => {
  const result = await step.do(
    `google-form-trigger-${nodeId}`,
    // @ts-ignore
    async () => context
  );

  // ✅ collapse Cloudflare boundary here
  return result as WorkflowContext;
};
