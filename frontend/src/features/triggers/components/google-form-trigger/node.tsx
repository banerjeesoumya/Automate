import { Node, NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseTriggerNode } from "../base-trigger-node";
import { GoogleFormTriggerDialog } from "./dialog";
import { ExecutionStatus } from "@/lib/utils";

type GeminiTriggerNodeData = {
    executionStatus?: ExecutionStatus;
    error?: string;
}

type GoogleFormTriggerNodeType = Node<GeminiTriggerNodeData>;

export const GoogleFormTriggerNode = memo((props: NodeProps<GoogleFormTriggerNodeType>) => {
    const [dialogOpen , setDialogOpen] = useState(false);

    const nodeStatus = props.data.executionStatus; 

    const handleSettings = () => setDialogOpen(true);

    return (
        <>
            <GoogleFormTriggerDialog open={dialogOpen} onOpenChange={setDialogOpen} />
            <BaseTriggerNode
                {...props}
                icon="/googleform.svg"
                name="Google Form"
                description="When form is submitted"
                status={nodeStatus}
                onDoubleClick={handleSettings}
                onSettings={handleSettings}
            />
        </>
    )
})