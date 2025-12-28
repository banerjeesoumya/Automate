import { executionApi } from "@/lib/api";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useExecutionParams } from "./use-executions-params";

export const useSuspenseExecution = (id: string) => {
    return useSuspenseQuery({
        queryKey: ["execution", id],
        queryFn: () => executionApi.getOneExecution({ id }),
        refetchInterval: 2000,
        refetchOnWindowFocus: true,
        refetchOnMount: "always",
        staleTime: 0
    });
};

export const useSuspenseExecutions = () => {
    const [params] = useExecutionParams();

    return useSuspenseQuery({
        queryKey: ["executions", params],
        queryFn: () => executionApi.getManyExecutions(params),
         refetchInterval: 2000,          // every 2 seconds
        refetchOnWindowFocus: true,
        refetchOnMount: "always",
        staleTime: 0
    });
};