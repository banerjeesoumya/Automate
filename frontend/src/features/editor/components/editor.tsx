"use client"

import { LoadingView } from "@/components/entity-components";
import { useSuspenseWorkflow } from "@/hooks/use-workflows";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";

export const Editor = ({ workflowId }: { workflowId: string }) => {
    useAuthRedirect({ requireAuth: true });
    const { data: workflow, isPending } = useSuspenseWorkflow(workflowId);
    return (
        <div>
            <p>
                {JSON.stringify(workflow, null, 2)}
            </p>
        </div>
    );
};



export const EditorLoading = () => {
    return (
        <LoadingView message="Loading editor..." />
    )
}