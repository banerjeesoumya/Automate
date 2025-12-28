"use client"

import { createId } from "@paralleldrive/cuid2"
import { NodeType } from "@/lib/utils"
import { GlobeIcon, MousePointerIcon } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { Separator } from "./ui/separator";
import { useReactFlow } from "@xyflow/react";
import { useCallback } from "react";
import { toast } from "sonner";

export type NodeTypeOption = {
    type: NodeType;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }> | string
}

const triggerNodes: NodeTypeOption[] = [
    {
        type: NodeType.Manual_Trigger,
        label: "Manual Trigger",
        description: "Start the workflow manually. Good for getting started.",
        icon: MousePointerIcon
    }, 
    {
        type: NodeType.GOOGLE_FORM_TRIGGER,
        label: "Google Form Trigger",
        description: "Trigger the workflow when a Google Form is submitted.",
        icon: "/googleform.svg"
    }
]

const executionNodes: NodeTypeOption[] = [
    {
        type: NodeType.HTTP_Request,
        label: "HTTP Request",
        description: "Make an HTTP request to an external API.",
        icon: GlobeIcon
    }, 
    {
        type: NodeType.GEMINI,
        label: "Gemini",
        description: "Use Google's Gemini model to generate text.",
        icon: "/gemini.svg"
    },
    {
        type: NodeType.OPEN_AI,
        label: "OpenAI",
        description: "Use OpenAI's models to generate text.",
        icon: "/openai.svg"
    },
    {
        type: NodeType.ANTHROPIC,
        label: "Anthropic",
        description: "Use Anthropic's Claude model to generate text.",
        icon: "/anthropic.svg"
    },
    {
        type: NodeType.DISCORD,
        label: "Discord",
        description: "Use Discord to send messages.",
        icon: "/discord.svg"
    },
    {
        type: NodeType.SLACK,
        label: "Slack",
        description: "Use Slack to send messages.",
        icon: "/slack.svg"
    }
]

interface NodeSelectorProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
}

export const NodeSelector = ({ open, onOpenChange, children }: NodeSelectorProps) => {
    const { setNodes, getNodes, screenToFlowPosition } = useReactFlow();
    const handleNodeSelect = useCallback((selection: NodeTypeOption) => {
        if (selection.type === NodeType.Manual_Trigger) {
            const nodes = getNodes();
            const hadManualTrigger = nodes.some((node) => node.type === NodeType.Manual_Trigger);
            if (hadManualTrigger) {
                toast.error("Only one Manual Trigger node is allowed per workflow.");
                return;
            }
        }
        setNodes((nodes) => {
            const hasInitialTrigger = nodes.some((node) => node.type === NodeType.Initial);

            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            const flowPosition = screenToFlowPosition({ x: centerX + (Math.random() - 0.5) * 200, y: centerY + (Math.random() - 0.5) * 200 });

            const newNode = {
                id: createId(),
                data: {},
                position: flowPosition,
                type: selection.type,
            };

            if (hasInitialTrigger) {
                return [newNode]
            }

            return [...nodes, newNode];
        })
        onOpenChange(false);
    }, [setNodes, getNodes, screenToFlowPosition, onOpenChange]);
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetTrigger asChild>{children}</SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>
                        What triggers this workflow?
                    </SheetTitle>
                    <SheetDescription>
                        A trigger starts the workflow. You can add more nodes after setting up the trigger.
                    </SheetDescription>
                </SheetHeader>
                <div>
                    {triggerNodes.map((node) => {
                        const Icon = node.icon;
                            return (
                                <div
                                    key={node.type}
                                    className="w-full justify-start h-auto py-5 px-4 rounded-none cursor-pointer border-l-2 border-transparent hover:border-l-primary"
                                    onClick={() => handleNodeSelect(node)}
                                >
                                    <div className="flex items-center gap-6 w-full overflow-hidden">
                                        {typeof Icon === "string" ? (
                                            <img
                                                src={Icon}
                                                alt={node.label}
                                                className="size-5 object-contain rounded-sm"
                                            />
                                        ) : (
                                            <Icon className="size-5" />
                                        )}
                                        <div className="flex flex-col items-start text-left">
                                            <span className="font-medium text-sm">
                                                {node.label}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {node.description}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
                <Separator />
                <div>
                    {executionNodes.map((node) => {
                        const Icon = node.icon;
                            return (
                                <div
                                    key={node.type}
                                    className="w-full justify-start h-auto py-5 px-4 rounded-none cursor-pointer border-l-2 border-transparent hover:border-l-primary"
                                    onClick={() => handleNodeSelect(node)}
                                >
                                    <div className="flex items-center gap-6 w-full overflow-hidden">
                                        {typeof Icon === "string" ? (
                                            <img
                                                src={Icon}
                                                alt={node.label}
                                                className="size-5 object-contain rounded-sm"
                                            />
                                        ) : (
                                            <Icon className="size-5" />
                                        )}
                                        <div className="flex flex-col items-start text-left">
                                            <span className="font-medium text-sm">
                                                {node.label}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {node.description}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
            </SheetContent>
        </Sheet>
    )
}