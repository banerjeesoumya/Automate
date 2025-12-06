import { credentialApi } from "@/lib/api";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation"
import { toast } from "sonner";
import { useCredentialsParams } from "./use-credentials-params";
import { CredentialType } from "@/lib/utils";

export const useCreateCredential = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ["createCredential"],
        mutationFn: (vars: { name: string; type: string; value: string }) =>
            credentialApi.createCredential(vars.name, vars.type, vars.value),

        onSuccess: (data: any) => {
            const name = data?.credential?.name ?? "Untitled";
            toast.success(`Credential "${name}" created successfully`);

            queryClient.invalidateQueries({ queryKey: ["credentials"] });

            router.push(`/credentials/${data.credential.id}`);
        },

        onError: (error: any) => {
            toast.error(`Failed to create credential: ${error?.message ?? "Unknown error"}`);
        }
    })
}

export const useDeleteCredential = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ["deleteCredential"],
        mutationFn: credentialApi.deleteCredential,

        onMutate: async ({ id }) => {
            await queryClient.cancelQueries({ queryKey: ["credentials"] });

            const previousData = queryClient.getQueryData(["credentials"]);

            queryClient.setQueryData(["credentials"], (old: any) => {
                if (!old?.items) return old;
                return {
                    ...old,
                    items: old.items.filter((item: any) => item.id !== id),
                };
            });

            return { previousData };
        },
        onSuccess: (data) => {
            const name = data?.credential?.name ?? "Untitled";
            toast.success(`Credential "${name}" deleted successfully`);
            queryClient.invalidateQueries({ queryKey: ["credentials"] });
        },

        onError: (error: any, variables, context: any) => {
            if (context?.previousData) {
                queryClient.setQueryData(["credentials"], context.previousData);
            }
            toast.error(`Failed to delete credential: ${error?.message ?? "Unknown error"}`);
        },

        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["credentials"] });
        }
    })
}

export const useSuspenseCredential = (id: string) => {
    return useSuspenseQuery({
        queryKey: ["credential", id],
        queryFn: () => credentialApi.getOneCredential({ id }),
    })
}

export const useUpdateCredential = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ["updateCredential"],
        mutationFn: async (vars: { id: string; name?: string; type?: string; value?: string }) => {
            return credentialApi.updateCredential({ id: vars.id }, vars.name, vars.type, vars.value);
        },

        onMutate: async ({ id, name, type, value }) => {
            await queryClient.cancelQueries({ queryKey: ["credentials"] });

            const previousData = queryClient.getQueryData(["credentials"]);

            // Optimistic update
            queryClient.setQueryData(["credentials"], (old: any) => {
                if (!old?.items) return old;
                return {
                    ...old,
                    items: old.items.map((item: any) =>
                        item.id === id ? { ...item, name: name ?? item.name, type: type ?? item.type, value: value ?? item.value } : item
                    ),
                };
            });

            return { previousData };
        },

        onSuccess: (data, { id }) => {
            toast.success(`Credential updated successfully`);
            queryClient.invalidateQueries({ queryKey: ["credentials"] });
            queryClient.invalidateQueries({ queryKey: ["credential", id] });
        },

        onError: (error: any, { id }, context: any) => {
            if (context?.previousData) {
                queryClient.setQueryData(["credentials", id], context.previousData);
            }
            toast.error(`Failed to update credential: ${error?.message ?? "Unknown error"}`);
        },

        onSettled: (_, __, { id }) => {
            queryClient.invalidateQueries({ queryKey: ["credentials", id] });
        }
    })
}

export const useSuspenseCredentials = () => {
    const [params] = useCredentialsParams();
    return useSuspenseQuery({
        queryKey: ["credentials", params],
        queryFn: () => credentialApi.getManyCredentials(params),
    });
}

export const useSuspenseCredentialTypes = (type: CredentialType) => {
    return useSuspenseQuery({
        queryKey: ["credentialTypes", type],
        queryFn: () => credentialApi.getCredentialsByType(type),
    });
}