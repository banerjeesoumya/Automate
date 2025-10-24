import { EmptyView, EntityContainer, EntityHeader, EntityList, EntityPagination, EntitySearch, LoadingView } from "@/components/entity-components";
import { useEntitySearch } from "@/hooks/use-entity-search";
import { useCreateWorkflow, useSuspenseWorkflows } from "@/hooks/use-workflows"
import { useWorkflowsParams } from "@/hooks/use-workflows-params";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const WorkflowsSearch = () => {
    const [params, setParams] = useWorkflowsParams();
    const { searchValue, onSearchChange } = useEntitySearch({
        params,
        setParams,
    })

    return (
        <EntitySearch
            placeholder="Search Workflows"
            value={searchValue}
            onChange={onSearchChange}
         />
    )
}

export const WorkFlowsList = () => {
    const workflows = useSuspenseWorkflows();
    const [params, setParams] = useWorkflowsParams();

    if (workflows.data.items.length === 0) {
        return <WorkflowsEmpty />
    }
    return (
        <>
            <EntityList
                items={workflows.data.items}
                renderItem={(workflow) => <p>{workflow.name}</p>}
                getKey={(workflow) => workflow.id}
                emptyView={<WorkflowsEmpty />}
            />
            <WorkflowsPagination
                page={workflows.data.page}
                totalPages={workflows.data.totalPages}
                isFetching={workflows.isFetching}
                onPageChange={(page) => setParams({ ...params, page })}
            />
        </>
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

interface WorkflowsPaginationProps {
  page: number;
  totalPages: number;
  isFetching: boolean;
  onPageChange: (page: number) => void;
}

export const WorkflowsPagination = ({
  page,
  totalPages,
  isFetching,
  onPageChange,
}: WorkflowsPaginationProps) => {
  return (
    <EntityPagination
      disabled={isFetching}
      page={page}
      totalPages={totalPages}
      onPageChange={onPageChange}
    />
  );
};

export const WorkflowsLoading = () => {
    return (
        <LoadingView message="Loading Workflows" />
    )
}

export const WorkflowsEmpty = () => {
    const router = useRouter();
    const createWorkflow = useCreateWorkflow();

    const handleCreate = () => {
        createWorkflow.mutate(undefined, {
            onSuccess: (data) => {
                // Redirect to the newly created workflow page
                router.push(`/workflows/${data.workflow.id}`);
            },
            onError: (error) => {
                console.error("Error creating workflow:", error);
            }
        });
    }
    return (
        <>
            <EmptyView
                message="No workflows found.You haven't created any workflows yet. Click the button below to create your first workflow."
                onNew={handleCreate}
            />
        </>
    )
}

export const WorkflowsContainer = ({ children }: { children: React.ReactNode }) => {
    return (
        <EntityContainer
            header={<WorkflowsHeader />}
            search={<WorkflowsSearch />}
            // pagination={<WorkflowsPagination />}
        >
            {children}
        </EntityContainer>
    )
}