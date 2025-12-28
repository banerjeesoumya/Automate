"use client"

import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useState } from "react";

import { GlobeIcon } from "lucide-react";
import { BaseExecutionNode } from "../../nodes/base-execution-node";
import { AnthropicFormValues, AnthropicTriggerDialog } from "./dialog";
// import { FormType, HTTPRequestTriggerDialog } from "./dialog";

type AnthropicNodeData = {
    variableName?: string;
    systemPrompt?: string;
    userPrompt?: string;
}

type AnthropicNodeType = Node<AnthropicNodeData>;

export const AnthropicNode = memo((props: NodeProps<AnthropicNodeType>) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const { setNodes } = useReactFlow();

    const nodeData = props.data;
    const description = nodeData?.userPrompt
        ? `claude-sonnet-4-5 ${nodeData.userPrompt.slice(0, 30)}...`
        : "Not Configured";

    const nodeStatus = "initial";

    const handleSettings = () => setDialogOpen(true);

    const handleSubmit = (values: AnthropicFormValues) => {
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
            <AnthropicTriggerDialog 
                open={dialogOpen} 
                onOpenChange={setDialogOpen}
                onSubmit={handleSubmit}
                defaultValues={nodeData}
            />
            <BaseExecutionNode
                {...props}
                id={props.id}
                icon="/anthropic.svg"
                name="Anthropic"
                status={nodeStatus}
                description={description}
                onDoubleClick={handleSettings}
                onSettings={handleSettings}
            />
        </>
    )
})

AnthropicNode.displayName = "AnthropicNode";