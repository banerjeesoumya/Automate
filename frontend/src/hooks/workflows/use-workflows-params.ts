import { workflowParams } from "@/lib/params"
import { useQueryStates } from "nuqs"

export const useWorkflowsParams = () => {
    return useQueryStates(workflowParams);
}