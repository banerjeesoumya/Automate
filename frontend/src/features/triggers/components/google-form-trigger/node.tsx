import { NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseTriggerNode } from "../base-trigger-node";
import { GoogleFormTriggerDialog } from "./dialog";

export const GoogleFormTriggerNode = memo((props: NodeProps) => {
    const [dialogOpen , setDialogOpen] = useState(false);

    const nodeStatus = "initial"; 

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