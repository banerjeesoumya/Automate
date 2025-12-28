import { executionsParams } from "@/lib/params"
import { useQueryStates } from "nuqs"

export const useExecutionParams = () => {
    return useQueryStates(executionsParams);
}