"use client"

import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "../base-execution-node";
import { GeminiFormValues, GeminiTriggerDialog } from "./dialog";

type GeminiNodeData = {
    variableName?: string;
    systemPrompt?: string;
    userPrompt?: string;
}

type GeminiNodeType = Node<GeminiNodeData>;

export const GeminiNode = memo((props: NodeProps<GeminiNodeType>) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const { setNodes } = useReactFlow();

    const nodeData = props.data;
    const description = nodeData?.userPrompt
        ? `gemini-2.5-flash-lite ${nodeData.userPrompt.slice(0, 30)}...`
        : "Not Configured";

    const nodeStatus = "initial";

    const handleSettings = () => setDialogOpen(true);

    const handleSubmit = (values: GeminiFormValues) => {
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
            <GeminiTriggerDialog 
                open={dialogOpen} 
                onOpenChange={setDialogOpen}
                onSubmit={handleSubmit}
                defaultValues={nodeData}
            />
            <BaseExecutionNode
                {...props}
                id={props.id}
                icon="/gemini.svg"
                name="Gemini"
                status={nodeStatus}
                description={description}
                onDoubleClick={handleSettings}
                onSettings={handleSettings}
            />
        </>
    )
})

GeminiNode.displayName = "GeminiNode";