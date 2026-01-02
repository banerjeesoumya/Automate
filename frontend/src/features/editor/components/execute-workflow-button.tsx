import { Button } from "@/components/ui/button";
import { useExecuteWorkflow } from "@/hooks/workflows/use-workflows";
import { FlaskConicalIcon, AlertCircleIcon } from "lucide-react";
import { useAtomValue } from "jotai";
import { isDirtyAtom } from "../store/atoms";
import { toast } from "sonner";

export const ExecuteWorkflowButton = ({
    workflowId,
}: {
    workflowId: string;
}) => {

    const executeWorkflow = useExecuteWorkflow();
    const isDirty = useAtomValue(isDirtyAtom);

    const handleExecute = () => {
        if (isDirty) {
            toast.error("You have unsaved changes. Please save the workflow to execute it.", {
                icon: <AlertCircleIcon className="size-4 text-destructive" />,
                duration: 5000,
            });
            return;
        }
        executeWorkflow.mutate({ workflowId: workflowId });
    }

    return (
        <Button size="lg" onClick={handleExecute} disabled={executeWorkflow.isPending}>
            <FlaskConicalIcon className="size-4" />
            Execute Workflow
        </Button>
    )
}