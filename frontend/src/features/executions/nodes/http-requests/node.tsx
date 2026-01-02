"use client"

import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useState } from "react";

import { GlobeIcon } from "lucide-react";
import { BaseExecutionNode } from "../../nodes/base-execution-node";
import { HTTPRequestFormValues, HTTPRequestTriggerDialog } from "./dialog";

type HTTPRequestNodeData = {
    variableName?: string;
    endpoint: string;
    method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    body?: string;
}

type HTTPRequestNodeType = Node<HTTPRequestNodeData>;

export const HTTPRequestNode = memo((props: NodeProps<HTTPRequestNodeType>) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const { setNodes } = useReactFlow();

    const nodeData = props.data;
    const description = nodeData?.endpoint
        ? `${nodeData.method || "GET"} ${nodeData.endpoint}`
        : "Not Configured";

    const nodeStatus = "initial";

    const handleSettings = () => setDialogOpen(true);

    const handleSubmit = (values: HTTPRequestFormValues) => {
        setNodes((nodes) => nodes.map((node) => {
            if (node.id === props.id) {
                return {
                    ...node,
                    data: {
                        ...node.data,
                        ...values
                    }
                }
            }
            return node;
        }))
    }

    return (
        <>
            <HTTPRequestTriggerDialog 
                open={dialogOpen} 
                onOpenChange={setDialogOpen}
                onSubmit={handleSubmit}
                defaultValues={nodeData}
            />
            <BaseExecutionNode
                {...props}
                id={props.id}
                icon={GlobeIcon}
                name="HTTP Request"
                status={nodeStatus}
                description={description}
                onDoubleClick={handleSettings}
                onSettings={handleSettings}
            />
        </>
    )
})

HTTPRequestNode.displayName = "HTTPRequestNode";