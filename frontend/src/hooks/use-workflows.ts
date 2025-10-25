import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { workflowApi } from "@/lib/api"
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useWorkflowsParams } from "./use-workflows-params";

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

export const useDeleteWorkflow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["deleteWorkflow"],
    mutationFn: workflowApi.deleteWorkflow,

    // ⚡ Optimistically remove the workflow before API resolves
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: ["workflows"] });

      const previousData = queryClient.getQueryData(["workflows"]);

      // Optimistic update
      queryClient.setQueryData(["workflows"], (old: any) => {
        if (!old?.items) return old;
        return {
          ...old,
          items: old.items.filter((item: any) => item.id !== id),
        };
      });

      return { previousData };
    },

    // ✅ Server success — confirm delete
    onSuccess: (data) => {
      const name = data.workflow?.name ?? "Untitled";
      toast.success(`Workflow "${name}" deleted successfully`);
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
    },

    // ❌ Server error — rollback
    onError: (error: any, _vars, context) => {
      queryClient.setQueryData(["workflows"], context?.previousData);
      toast.error(`Failed to delete workflow: ${error?.message ?? "Unknown error"}`);
    },

    // 🧹 Always refetch after success/error to sync pagination
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
    },
  });
};


export const useSuspenseWorkflows = () => {
  const [params] = useWorkflowsParams();

  return useSuspenseQuery({
    queryKey: ["workflows", params],
    queryFn: () => workflowApi.getManyWorkflows(params),
  });
};
  
export const useSuspenseWorkflow =  (id: string) => {
  return useSuspenseQuery({
    queryKey: ["workflow", id],
    queryFn: () => workflowApi.getOneWorkflow(id),
  })
}

export const useUpdateWorkflow = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["updateWorkflow"],
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      return workflowApi.updateWorkflowName({ id }, name);
    },

    onMutate: async ({ id, name }) => {
      await queryClient.cancelQueries({ queryKey: ["workflows"] });

      const previousData = queryClient.getQueryData(["workflows"]);

      // Optimistic update
      queryClient.setQueryData(["workflows"], (old: any) => {
        if (!old?.items) return old;
        return {
          ...old,
          items: old.items.map((item: any) =>
            item.id === id ? { ...item, name } : item
          ),
        };
      });

      return { previousData };
    },

    onSuccess: (data) => {
      const name = data.workflow.name ?? "Untitled";
      toast.success(`Workflow "${name}" updated successfully`);
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
      queryClient.invalidateQueries({ queryKey: ["workflow", data.workflow.id] });
    },

    onError: (error: any, _vars, context) => {
      queryClient.setQueryData(["workflows"], context?.previousData);
      toast.error(`Failed to update workflow: ${error?.message ?? "Unknown error"}`);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
    },
  });
};
