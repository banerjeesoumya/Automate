import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { templateApi } from "@/lib/api"
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTemplatesParams } from "./use-templates-params";


export const useSuspenseTemplates = () => {
  const [params] = useTemplatesParams();

  return useSuspenseQuery({
    queryKey: ["templates", params],
    queryFn: () => templateApi.getManyTemplates(params),
  });
};
  
export const useSuspenseTemplate =  (id: string) => {
  return useSuspenseQuery({
    queryKey: ["template", id],
    queryFn: () => templateApi.getOneTemplate(id),
  })
}

export const useUseTemplate = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["useTemplate"],
    mutationFn: templateApi.useTemplate,

    onSuccess: (data) => {
      toast.success("Template added to your workflows");

      queryClient.invalidateQueries({ queryKey: ["workflows"] });
      queryClient.invalidateQueries({ queryKey: ["templates"] });

      router.push(`/workflows/${data.workflowId}`);
    },

    onError: (error: any) => {
      toast.error(`Failed to use template: ${error?.message ?? "Unknown error"}`);
    },
  });
};

export const useCreateTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["createTemplate"],
    mutationFn:  templateApi.createTemplate,
    onSuccess: () => {
      toast.success("Template created successfully");

      queryClient.invalidateQueries({ queryKey: ["templates"] });
    },

    onError: (error: any) => {
      toast.error(`Failed to create template: ${error?.message ?? "Unknown error"}`);
    },
  });
};