import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { workflowApi } from "@/lib/api"
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const useCreateWorkflow = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["createWorkflow"],
    mutationFn: workflowApi.createWorkflow,
    onSuccess: (data) => {
      // assuming your API response structure is like { ok: true, workflow: { name: ... } }
      const name = data.workflow.name ?? "Untitled";
      toast.success(`Workflow "${name}" created successfully`);

      // Invalidate all workflows list to trigger refetch
      queryClient.invalidateQueries({ queryKey: ["workflows"] });

      // Optionally navigate
      router.push(`/workflows/${data.workflow.id}`);
    },
    onError: (error: any) => {
      toast.error(`Failed to create workflow: ${error?.message ?? "Unknown error"}`);
    },
  });
};
export const useSuspenseWorkflows = () => {
    return useSuspenseQuery({
    queryKey: ["workflows"],
    queryFn: workflowApi.getManyWorkflows,
  })
}
  