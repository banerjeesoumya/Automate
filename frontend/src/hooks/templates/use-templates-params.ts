import { templateParams } from "@/lib/params"
import { useQueryStates } from "nuqs"

export const useTemplatesParams = () => {
    return useQueryStates(templateParams);
}