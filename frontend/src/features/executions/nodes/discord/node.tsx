"use client"

import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useState } from "react";

import { BaseExecutionNode } from "../../nodes/base-execution-node";
import { DiscordFormValues, DiscordTriggerDialog } from "./dialog";

type DiscordNodeData = {
    webhookUrl?: string;
    content?: string;
    username?: string;
}

type DiscordNodeType = Node<DiscordNodeData>;

export const DiscordNode = memo((props: NodeProps<DiscordNodeType>) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const { setNodes } = useReactFlow();

    const nodeData = props.data;
    const description = nodeData?.content
        ? `Send ${nodeData.content.slice(0, 30)}...`
        : "Not Configured";

    const nodeStatus = "initial";

    const handleSettings = () => setDialogOpen(true);

    const handleSubmit = (values: DiscordFormValues) => {
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
            <DiscordTriggerDialog 
                open={dialogOpen} 
                onOpenChange={setDialogOpen}
                onSubmit={handleSubmit}
                defaultValues={nodeData}
            />
            <BaseExecutionNode
                {...props}
                id={props.id}
                icon="/discord.svg"
                name="Discord"
                status={nodeStatus}
                description={description}
                onDoubleClick={handleSettings}
                onSettings={handleSettings}
            />
        </>
    )
})

DiscordNode.displayName = "DiscordNode";