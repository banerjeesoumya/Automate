"use client"

import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useState } from "react";

import { BaseExecutionNode } from "../base-execution-node";
import { OpenAIFormValues, OpenAITriggerDialog } from "./dialog";
import { ExecutionStatus } from "@/lib/utils";

type OpenAINodeData = {
    variableName?: string;
    systemPrompt?: string;
    userPrompt?: string;

    executionStatus?: ExecutionStatus;
    error?: string;
}

type OpenAINodeType = Node<OpenAINodeData>;

export const OpenAINode = memo((props: NodeProps<OpenAINodeType>) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const { setNodes } = useReactFlow();

    const nodeData = props.data;
    const description = nodeData?.userPrompt
        ? `gpt-4 ${nodeData.userPrompt.slice(0, 30)}...`
        : "Not Configured";

    const nodeStatus = nodeData.executionStatus;

    const handleSettings = () => setDialogOpen(true);

    const handleSubmit = (values: OpenAIFormValues) => {
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
            {dialogOpen && (
                <OpenAITriggerDialog
                    open={dialogOpen}
                    onOpenChange={setDialogOpen}
                    onSubmit={handleSubmit}
                    defaultValues={nodeData}
                />
            )}
            <BaseExecutionNode
                {...props}
                id={props.id}
                icon="/openai.svg"
                name="OpenAI"
                status={nodeStatus}
                description={description}
                onDoubleClick={handleSettings}
                onSettings={handleSettings}
            />
        </>
    )
})

OpenAINode.displayName = "OpenAINode";