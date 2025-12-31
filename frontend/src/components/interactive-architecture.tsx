"use client"

import React, { useMemo, useState } from "react"
import {
    ReactFlow,
    Handle,
    Position,
    Background,
    EdgeProps,
    getBezierPath,
    NodeProps,
    Node,
    Edge,
    BaseEdge,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import {
    Code2,
    Globe,
    Sparkles,
    Database,
    User,
    Layers,
    Cpu,
    Cloud,
    Zap
} from "lucide-react"

// --- Custom Edge ---

const AnimatedEdge = ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
}: EdgeProps) => {
    const [edgePath] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    })

    return (
        <>
            <path
                id={id}
                style={{
                    ...style,
                    strokeWidth: 2,
                    stroke: "currentColor",
                    opacity: 0.2,
                    strokeDasharray: "5 5",
                }}
                className="text-muted-foreground/50"
                d={edgePath}
                fill="none"
            />
            <motion.path
                d={edgePath}
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeDasharray="5 5"
                className="text-primary/50"
                animate={{
                    strokeDashoffset: [0, -20],
                }}
                transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "linear",
                }}
            />
        </>
    )
}

// --- Custom Nodes ---

interface ArchitectureNodeData extends Record<string, any> {
    label?: string
    icon?: React.ElementType
    icons?: React.ElementType[]
    colorClass?: string
    bgClass?: string
    borderClass?: string
}

const ArchitectureNode = ({ data, selected }: any) => {
    const Icon = data.icon
    const colorClass = data.colorClass || "text-primary"
    const bgClass = data.bgClass || "bg-primary/10"
    const borderClass = data.borderClass || "border-primary/50"

    return (
        <div className={cn(
            "relative px-4 py-2 rounded-lg border-2 bg-background shadow-md transition-all group",
            borderClass,
            selected ? "ring-2 ring-primary ring-offset-2" : ""
        )}>
            {data.label && (
                <div className={cn("absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-mono uppercase tracking-wider font-bold", colorClass)}>
                    {data.label}
                </div>
            )}

            <div className="flex flex-wrap gap-2 justify-center items-center min-w-[40px] min-h-[40px]">
                {data.icons ? (
                    data.icons.map((SubIcon: any, i: number) => (
                        <div key={i} className={cn("p-1.5 rounded-md", bgClass)}>
                            <SubIcon className={cn("size-4", colorClass)} />
                        </div>
                    ))
                ) : Icon ? (
                    <div className={cn("p-2 rounded-md", bgClass)}>
                        <Icon className={cn("size-6", colorClass)} />
                    </div>
                ) : null}
            </div>

            <Handle type="target" position={Position.Left} className="opacity-0" />
            <Handle type="source" position={Position.Right} className="opacity-0" />

            {/* Connection dots for visual style */}
            <div className={cn("absolute -left-1.5 top-1/2 -translate-y-1/2 size-3 rounded-full border-2 bg-background", borderClass)} />
            <div className={cn("absolute -right-1.5 top-1/2 -translate-y-1/2 size-3 rounded-full border-2 bg-background", borderClass)} />
        </div>
    )
}

// --- Browser Mockup ---

const BrowserMockup = () => {
    return (
        <div className="w-[300px] h-[200px] bg-background border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col">
            <div className="bg-muted/50 border-b border-border p-2 flex items-center gap-1.5">
                <div className="flex gap-1">
                    <div className="size-2 rounded-full bg-red-500/50" />
                    <div className="size-2 rounded-full bg-yellow-500/50" />
                    <div className="size-2 rounded-full bg-green-500/50" />
                </div>
                <div className="flex-1 px-4">
                    <div className="h-4 bg-background border border-border rounded-md w-full" />
                </div>
            </div>
            <div className="flex-1 p-4 flex flex-col gap-3">
                <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
                <div className="h-12 bg-muted/30 animate-pulse rounded w-full mt-auto" />
            </div>
        </div>
    )
}

const UIComponentNode = () => (
    <div className="relative">
        <Handle type="target" position={Position.Left} className="opacity-0" />
        <BrowserMockup />
    </div>
)

// --- Data ---

const nodeTypes = {
    architecture: ArchitectureNode,
    ui: UIComponentNode,
}

const edgeTypes = {
    animated: AnimatedEdge,
}

const TABS = [
    {
        id: "automate",
        label: "How it works",
        icon: Sparkles,
        description: "Seamless Workflow Orchestration",
        quote: '"The architecture leverages Cloudflare Workers and Workflows to provide a high-performance, scalable backend that handles complex logic with ease, connecting UI interactions directly to managed execution steps."',
        // author: "Edge-HRMS Backend Architecture",
        nodes: [
            {
                id: '1',
                type: 'architecture',
                position: { x: -100, y: 50 },
                data: {
                    label: 'User Interface',
                    icon: User,
                    colorClass: 'text-blue-500',
                    bgClass: 'bg-blue-500/10',
                    borderClass: 'border-blue-500/30'
                }
            },
            {
                id: '2',
                type: 'architecture',
                position: { x: 100, y: 50 },
                data: {
                    label: 'API Request',
                    icon: Globe,
                    colorClass: 'text-orange-500',
                    bgClass: 'bg-orange-500/10',
                    borderClass: 'border-orange-500/30'
                }
            },
            {
                id: '3',
                type: 'architecture',
                position: { x: 300, y: 50 },
                data: {
                    label: 'Edge Worker',
                    icon: Cloud,
                    colorClass: 'text-sky-500',
                    bgClass: 'bg-sky-500/10',
                    borderClass: 'border-sky-500/30'
                }
            },
            {
                id: '4',
                type: 'architecture',
                position: { x: 500, y: 50 },
                data: {
                    label: 'Workflows',
                    icon: Zap,
                    colorClass: 'text-purple-500',
                    bgClass: 'bg-purple-500/10',
                    borderClass: 'border-purple-500/30'
                }
            },
            {
                id: '5',
                type: 'architecture',
                position: { x: 700, y: 0 },
                data: {
                    label: 'Compute / Logic',
                    icons: [Cpu, Code2],
                    colorClass: 'text-emerald-500',
                    bgClass: 'bg-emerald-500/10',
                    borderClass: 'border-emerald-500/30'
                }
            },
            {
                id: '6',
                type: 'architecture',
                position: { x: 700, y: 100 },
                data: {
                    label: 'Postgres DB',
                    icon: Database,
                    colorClass: 'text-pink-500',
                    bgClass: 'bg-pink-500/10',
                    borderClass: 'border-pink-500/30'
                }
            },
            {
                id: '7',
                type: 'ui',
                position: { x: 950, y: 0 },
                data: {}
            },
        ],
        edges: [
            { id: 'e1-2', source: '1', target: '2', type: 'animated' },
            { id: 'e2-3', source: '2', target: '3', type: 'animated' },
            { id: 'e3-4', source: '3', target: '4', type: 'animated' },
            { id: 'e4-5', source: '4', target: '5', type: 'animated' },
            { id: 'e4-6', source: '4', target: '6', type: 'animated' },
            { id: 'e5-7', source: '5', target: '7', type: 'animated' },
            { id: 'e6-7', source: '6', target: '7', type: 'animated' },
        ]
    }
]

// --- Main Component ---

export function InteractiveArchitecture() {
    const [activeTab, setActiveTab] = useState(TABS[0].id)
    const [isDesktop, setIsDesktop] = useState(false)

    React.useEffect(() => {
        const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024)
        checkDesktop()
        window.addEventListener("resize", checkDesktop)
        return () => window.removeEventListener("resize", checkDesktop)
    }, [])

    const currentTab = TABS.find(t => t.id === activeTab) || TABS[0]

    return (
        <section id="architecture" className="relative py-24 px-4 bg-muted/5">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 border border-border/50 backdrop-blur-sm mb-6"
                    >
                        <Sparkles className="w-4 h-4 text-[#e78a53]" />
                        <span className="text-sm font-medium text-foreground/80">Architecture</span>
                    </motion.div>

                    <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground via-foreground to-foreground/60 bg-clip-text text-transparent mb-4">
                        Cloud Architecture
                    </h2>

                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                        Our backend is built for scale, performance, and reliability. Explore the interactive flows below.
                    </p>
                </motion.div>

                <div className="w-full flex flex-col gap-8">
                    {/* Tab Switcher */}
                    <div className="flex justify-center">
                        <div className="flex p-1.5 bg-muted/30 backdrop-blur-md rounded-full border border-border shadow-inner">
                            {TABS.map((tab) => {
                                const Icon = tab.icon
                                const isActive = activeTab === tab.id
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={cn(
                                            "relative flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 outline-none",
                                            isActive
                                                ? "text-primary-foreground shadow-lg"
                                                : "text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        {isActive && (
                                            <motion.div
                                                layoutId="active-tab"
                                                className="absolute inset-0 bg-primary rounded-full"
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}
                                        <Icon className={cn("size-4 relative z-10", isActive && "text-primary-foreground")} />
                                        <span className="relative z-10">{tab.label}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Diagram Area */}
                    <div className="relative w-full flex flex-col lg:h-[800px] border border-border/50 rounded-3xl bg-muted/5 overflow-hidden group/diagram shadow-2xl">
                        {/* Decorative Grid */}
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
                                    </pattern>
                                </defs>
                                <rect width="100%" height="100%" fill="url(#grid)" />
                            </svg>
                        </div>

                        {/* Background Gradients */}
                        <div className="absolute top-0 left-1/4 w-1/2 h-1/2 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
                        <div className="absolute bottom-0 right-1/4 w-1/2 h-1/2 bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }}
                                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                                exit={{ opacity: 0, scale: 1.02, filter: "blur(10px)" }}
                                transition={{ duration: 0.4 }}
                                className="w-full h-[400px] sm:h-[500px] lg:h-full"
                            >
                                <ReactFlow
                                    nodes={currentTab.nodes as Node[]}
                                    edges={currentTab.edges as Edge[]}
                                    nodeTypes={nodeTypes}
                                    edgeTypes={edgeTypes}
                                    fitView
                                    fitViewOptions={{ padding: 0.2 }}
                                    zoomOnScroll={false}
                                    zoomOnPinch={false}
                                    panOnDrag={false}
                                    nodesDraggable={false}
                                    nodesConnectable={false}
                                    elementsSelectable={false}
                                    className="pointer-events-none"
                                >
                                    <Background color="transparent" />
                                </ReactFlow>
                            </motion.div>
                        </AnimatePresence>

                        {/* Content Info */}
                        <div className="relative p-8 lg:p-12 max-w-5xl z-10 w-full">
                            <motion.div
                                key={activeTab + "-text"}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                                className="flex flex-col gap-3 sm:gap-6"
                            >
                                <div className="flex flex-col gap-1 sm:gap-3">
                                    <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight text-foreground/90">
                                        {currentTab.description}
                                    </h3>
                                    <p className="text-base sm:text-lg md:text-xl text-muted-foreground italic font-light leading-relaxed">
                                        {currentTab.quote}
                                    </p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="h-px w-8 bg-border" />
                                    <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-border/50 bg-background/50 backdrop-blur-sm">
                                        <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                                            Architecture
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
