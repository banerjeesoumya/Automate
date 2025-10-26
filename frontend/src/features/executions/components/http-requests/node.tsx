"use client"

import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useState } from "react";

import { GlobeIcon } from "lucide-react";
import { BaseExecutionNode } from "../base-execution-node";
// import { FormType, HTTPRequestTriggerDialog } from "./dialog";

type HTTPRequestNodeData = {
    endpoint: string;
    method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    body?: string;
    [key: string]: unknown;
}

type HTTPRequestNodeType = Node<HTTPRequestNodeData>;

export const HTTPRequestNode = memo((props: NodeProps<HTTPRequestNodeType>) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const { setNodes } = useReactFlow();

    const nodeData = props.data;
    const description = nodeData?.endpoint
        ? `${nodeData.method || "GET"} ${nodeData.endpoint}`
        : "Not Configured";

    const nodeStatus = "initial"

    const handleSettings = () => setDialogOpen(true);

    const handleSubmit = () => {
        // setNodes((nodes) => nodes.map((node) => {
        //     if (node.id === props.id) {
        //         return {
        //             ...node,
        //             data: {
        //                 ...node.data,
        //                 endpoint: values.endpoint,
        //                 method: values.method,
        //                 body: values.body,
        //             }
        //         }
        //     }
        //     return node;
        // }))
    }

    return (
        <>
            {/* <HTTPRequestTriggerDialog 
                open={dialogOpen} 
                onOpenChange={setDialogOpen}
                onSubmit={handleSubmit}
                defaultEndpoint={nodeData.endpoint}
                defaultMethod={nodeData.method}
                defaultBody={nodeData.body}
            /> */}
            <BaseExecutionNode
                {...props}
                id={props.id}
                icon={GlobeIcon}
                name="HTTP Request"
                
                description={description}
                onDoubleClick={handleSettings}
                onSettings={handleSettings}
            />
        </>
    )
})

HTTPRequestNode.displayName = "HTTPRequestNode";