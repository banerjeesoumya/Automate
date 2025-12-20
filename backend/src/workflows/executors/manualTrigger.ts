import { NodeExecutor, WorkflowContext } from "../lib/types";

type ManualTriggerData = Record<string, unknown>;

export const manualTriggerExecutor: NodeExecutor<ManualTriggerData> = async ({
  nodeId,
  context,
  step,
}) => {
  const result = await step.do(
    `manual-trigger-${nodeId}`,
    // @ts-ignore
    async () => context
  );

  // ✅ collapse Cloudflare boundary here
  return result as WorkflowContext;
};
