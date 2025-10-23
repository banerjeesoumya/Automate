import { EntityContainer, EntityHeader } from "@/components/entity-components";
import { useCreateWorkflow, useSuspenseWorkflows } from "@/hooks/use-workflows"
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const WorkFlowsList = () => {
    const workflows = useSuspenseWorkflows();

    return (
        <p>
            {JSON.stringify(workflows.data, null, 2)}
        </p>
    )
}

export const WorkflowsHeader = ({ disabled }: { disabled?: boolean }) => {
    const createWorkflow = useCreateWorkflow();
    const router = useRouter()

    const handleCreateWorkflow = () => {
    createWorkflow.mutate(undefined, {
      onError: (error) => {
        toast.error(`Failed to create workflow: ${error?.message ?? "Unknown error"}`);
        console.error("Error creating workflow:", error);
      },
    });
  };
    return (
        <>
            <EntityHeader
                title="Workflows"
                description="Manage your workflows"
                newButtonLabel="New Workflow"
                disabled={disabled}
                onNew={handleCreateWorkflow}
                isCreating={createWorkflow.isPending}
            />
        </>
    )
}

export const WorkflowsContainer = ({ children }: { children: React.ReactNode }) => {
    return (
        <EntityContainer
            header={<WorkflowsHeader />}
            search={<>  </>}
            pagination={<></>}
        >
            {children}
        </EntityContainer>
    )
}