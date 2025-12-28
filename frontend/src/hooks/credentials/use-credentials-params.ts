import { credentialsParams } from "@/lib/params"
import { useQueryStates } from "nuqs"

export const useCredentialsParams = () => {
    return useQueryStates(credentialsParams);
}