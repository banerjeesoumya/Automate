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

  return result as WorkflowContext;
};
