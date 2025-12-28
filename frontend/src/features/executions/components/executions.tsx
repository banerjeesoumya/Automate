"use client"

import { EmptyView, EntityContainer, EntityHeader, EntityItem, EntityList, EntityPagination, EntitySearch, LoadingView } from "@/components/entity-components";
import { CheckCircle2Icon, ClockIcon, Loader2Icon, XCircleIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useSuspenseExecutions } from "@/hooks/executions/use-executions";
import { useExecutionParams } from "@/hooks/executions/use-executions-params";
import { Execution, ExecutionStatus } from "@/lib/utils";

export const ExecutionsList = () => {

    // throw new Error("Test Error in WorkflowsList");
    const executions = useSuspenseExecutions();
    
    return (
        <EntityList
            items={executions.data.items}
            renderItem={(execution) => <ExecutionItem execution={execution} />}
            getKey={(execution) => execution.id}
            emptyView={<ExecutionsEmpty />}
        />
    )
}

export const ExecutionsHeader = () => {

    return (
        <>
            <EntityHeader
                title="Executions"
                description="View your workflow executions."
            />
        </>
    )
}

export const ExecutionsPagination = () => {
    const executions = useSuspenseExecutions();
    const [params, setParams] = useExecutionParams();

    return (
        <EntityPagination
            disabled={executions.isFetching}
            page={executions.data.page}
            totalPages={executions.data.totalPages}
            onPageChange={(page) => setParams({ ...params, page })}
        />
    )
}

export const ExecutionsContainer = ({ children }: { children: React.ReactNode }) => {
    return (
        <EntityContainer
            header={<ExecutionsHeader />}
            pagination={<ExecutionsPagination />}
        >
            {children}
        </EntityContainer>
    )
}

export const ExecutionsLoading = () => {
    return (
        <LoadingView message="Loading Executions" />
    )
}

export const ExecutionsEmpty = () => {
    return (
        <>
            <EmptyView
                message="No executions found. You haven't executed any workflows yet. Click the button below to create your first workflow."
            />
        </>
    )
}

const getStatusIcon = (status: ExecutionStatus) => {
    switch (status) {
        case ExecutionStatus.COMPLETE:
            return <CheckCircle2Icon className="text-green-600 size-5" />;
        case ExecutionStatus.ERRORED:
            return <XCircleIcon className="text-red-600 size-5" />;
        case ExecutionStatus.RUNNING:
            return <Loader2Icon className="text-blue-600 size-5 animate-spin" />;
        default:
            return <ClockIcon className="size-5 text-muted-foreground" />;
    }
}

const formatStatus = (status: ExecutionStatus) => {
    return status.charAt(0) + status.slice(1).toLowerCase();  
}

export const ExecutionItem = ({ execution }: { execution: Execution & {
    workflow: {
        id: string;
        name: string;
    }
} }) => {

    const duration = execution.completedAt ? Math.round((new Date(execution.completedAt).getTime() - new Date(execution.startedAt).getTime()) / 1000) : null;

    const subtitle = (
        <>
            {execution.workflow.name} &bull; Started{" "}
            {formatDistanceToNow(execution.startedAt, { addSuffix: true })}
            {duration !== null && <> &bull; Took: {duration}s</>}
        </>
    )
    return (
        <EntityItem
           href={`/executions/${execution.id}`}
           title={formatStatus(execution.status)}
           subtitle={subtitle}
           image={
            <div className="size-8 flex items-center justify-center">
                {getStatusIcon(execution.status)}
            </div>
           }
        />
    )
}