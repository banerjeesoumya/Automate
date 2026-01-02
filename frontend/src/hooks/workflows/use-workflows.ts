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
      const name = data.workflow.name ?? "Untitled";
      toast.success(`Workflow "${name}" created successfully`);

      queryClient.invalidateQueries({ queryKey: ["workflows"] });

      router.push(`/workflows/${data.workflow.id}`);
    },
    onError: (error: any) => {
      toast.error(`Failed to create workflow: ${error?.message ?? "Unknown error"}`);
    },
  });
};

export const useExecuteWorkflow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["executeWorkflow"],
    mutationFn: async ({ workflowId }: { workflowId: string }) => {
      workflowApi.executeWorkflow({ workflowId });
    },
    onSuccess: () => {
      toast.success("Workflow execution started successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to execute workflow: ${error?.message ?? "Unknown error"}`);
    }
  })
}

export const useDeleteWorkflow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["deleteWorkflow"],
    mutationFn: workflowApi.deleteWorkflow,

    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: ["workflows"] });

      const previousData = queryClient.getQueryData(["workflows"]);
      queryClient.setQueryData(["workflows"], (old: any) => {
        if (!old?.items) return old;
        return {
          ...old,
          items: old.items.filter((item: any) => item.id !== id),
        };
      });

      return { previousData };
    },

    onSuccess: (data) => {
      const name = data.workflow?.name ?? "Untitled";
      toast.success(`Workflow "${name}" deleted successfully`);
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
    },

    onError: (error: any, _vars, context) => {
      queryClient.setQueryData(["workflows"], context?.previousData);
      toast.error(`Failed to delete workflow: ${error?.message ?? "Unknown error"}`);
    },
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

export const useUpdateWorkflowName = () => {
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

export const useUpdateWorkflowNodesAndEdges = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["updateWorkflowNodesAndEdges"],

    mutationFn: async ({ id, nodes, edges }: { id: string; nodes: any[]; edges: any[] }) => {
      return workflowApi.updateWorkflowNodesAndEdges({ id }, nodes, edges);
    },

    onMutate: async ({ id, nodes, edges }) => {
      await queryClient.cancelQueries({ queryKey: ["workflow", id] });

      const previousData = queryClient.getQueryData(["workflow", id]);

      queryClient.setQueryData(["workflow", id], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          nodes,
          edges,
        };
      });

      return { previousData };
    },

    onSuccess: (data, { id }) => {
      toast.success("Workflow updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["workflow", id] });
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
    },

    onError: (error: any, { id }, context) => {
      queryClient.setQueryData(["workflow", id], context?.previousData);
      toast.error(`Failed to update workflow: ${error?.message ?? "Unknown error"}`);
    },
    onSettled: (_, __, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["workflow", id] });
    },
  });
};
