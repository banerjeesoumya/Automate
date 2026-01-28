import { Node, NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseTriggerNode } from "../base-trigger-node";
import { MousePointerIcon } from "lucide-react";
import { ManualTriggerDialog } from "./dialog";
import { ExecutionStatus } from "@/lib/utils";

type ManualTriggerNodeData = {
  executionStatus?: ExecutionStatus;
  error?: string;
};

type ManualTriggerNodeType = Node<ManualTriggerNodeData>;

export const ManualTriggerNode = memo((props: NodeProps<ManualTriggerNodeType>) => {
    const [dialogOpen , setDialogOpen] = useState(false);

    const nodeStatus = props.data.executionStatus 

    const handleSettings = () => setDialogOpen(true);

    return (
        <>
            <ManualTriggerDialog open={dialogOpen} onOpenChange={setDialogOpen} />
            <BaseTriggerNode
                {...props}
                icon={MousePointerIcon}
                name="When clicking 'Execute Workflow'"
                status={nodeStatus}
                onDoubleClick={handleSettings}
                onSettings={handleSettings}
            />
        </>
    )
})