"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import {
    ReactFlow,
    Background,
    Controls,
    useNodesState,
    useEdgesState,
    addEdge,
    useReactFlow,
    ReactFlowProvider,
    type Node,
    type Edge,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { nodeComponents } from "@/lib/node-components"
import { AnimatedCursor } from "../../../components/animated-cursor"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Search, Zap, Cpu, MessageSquare, Globe, Mail } from "lucide-react"

export type DemoAction =
    | { type: "MOVE"; x: number; y: number }
    | { type: "CLICK" }
    | { type: "ADD_NODE"; node: Node }
    | { type: "CONNECT"; edge: Edge }
    | { type: "WAIT"; ms: number }
    | { type: "SHOW_MENU"; visible: boolean }
    | { type: "RESET" }

interface DemoCanvasProps {
    script: DemoAction[]
    title?: string
    height?: string
}

function DemoCanvasContent({ script, height = "400px" }: DemoCanvasProps) {
    const { fitView } = useReactFlow()
    const [nodes, setNodes, onNodesChange] = useNodesState([])
    const [edges, setEdges, onEdgesChange] = useEdgesState([])
    const [cursorPos, setCursorPos] = useState({ x: "50%", y: "50%" })
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [showPulse, setShowPulse] = useState(false)

    const containerRef = useRef<HTMLDivElement>(null)
    const scriptIndexRef = useRef(0)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    const runScript = useCallback(() => {
        if (scriptIndexRef.current >= script.length) {
            timeoutRef.current = setTimeout(() => {
                setNodes([])
                setEdges([])
                setIsMenuOpen(false)
                scriptIndexRef.current = 0
                runScript()
            }, 3000)
            return
        }

        const action = script[scriptIndexRef.current]

        switch (action.type) {
            case "MOVE":
                setCursorPos({ x: `${action.x}%`, y: `${action.y}%` })
                timeoutRef.current = setTimeout(() => {
                    scriptIndexRef.current++
                    runScript()
                }, 800)
                break

            case "CLICK":
                setShowPulse(true)
                setTimeout(() => setShowPulse(false), 400)
                timeoutRef.current = setTimeout(() => {
                    scriptIndexRef.current++
                    runScript()
                }, 500)
                break

            case "ADD_NODE":
                // @ts-ignore
                setNodes((nds) => [...nds, action.node])
                setTimeout(() => fitView({ duration: 800, padding: 0.4 }), 50)
                scriptIndexRef.current++
                runScript()
                break

            case "CONNECT":
                // @ts-ignore
                setEdges((eds) => addEdge(action.edge, eds))
                setTimeout(() => fitView({ duration: 800, padding: 0.4 }), 50)
                scriptIndexRef.current++
                runScript()
                break

            case "WAIT":
                timeoutRef.current = setTimeout(() => {
                    scriptIndexRef.current++
                    runScript()
                }, action.ms)
                break

            case "SHOW_MENU":
                setIsMenuOpen(action.visible)
                timeoutRef.current = setTimeout(() => {
                    scriptIndexRef.current++
                    runScript()
                }, 500)
                break

            case "RESET":
                setNodes([])
                setEdges([])
                setIsMenuOpen(false)
                scriptIndexRef.current++
                runScript()
                break
        }
    }, [script, setNodes, setEdges, fitView])

    useEffect(() => {
        runScript()
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
        }
    }, [runScript])

    const menuCategories = [
        {
            title: "Triggers",
            items: [
                { name: "Google Form", icon: Globe, desc: "When a form is submitted" },
                { name: "Manual Trigger", icon: Zap, desc: "Run workflow manually" }
            ]
        },
        {
            title: "AI & Logic",
            items: [
                { name: "Gemini AI", icon: Cpu, desc: "Summarize and analyze" },
                { name: "HTTP Request", icon: Globe, desc: "Call external APIs" }
            ]
        },
        {
            title: "Communication",
            items: [
                { name: "Slack", icon: MessageSquare, desc: "Post a message" },
                { name: "Discord", icon: Mail, desc: "Send a notification" }
            ]
        }
    ]

    return (
        <div
            ref={containerRef}
            className="w-full border border-border rounded-xl overflow-hidden bg-card/50 shadow-inner relative"
            style={{ height }}
        >
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeComponents}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                fitView
                fitViewOptions={{ padding: 0.4 }}
                nodesDraggable={false}
                nodesConnectable={false}
                elementsSelectable={false}
                panOnDrag={false}
                zoomOnScroll={false}
                zoomOnPinch={false}
                zoomOnDoubleClick={false}
                minZoom={0.2}
                maxZoom={1.5}
            >
                <Background gap={12} size={1} />
                <Controls showInteractive={false} className="opacity-50" />
            </ReactFlow>

            <div className="absolute top-4 left-4 z-10">
                <div className="bg-background/80 backdrop-blur-sm border border-border px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-medium text-muted-foreground shadow-sm">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Live Preview Mode
                </div>
            </div>

            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="absolute bottom-16 left-1/2 -translate-x-1/2 z-40 w-72 bg-background border border-border rounded-xl shadow-2xl overflow-hidden"
                    >
                        <div className="p-3 border-b flex items-center gap-2 bg-muted/30">
                            <Search className="w-4 h-4 text-muted-foreground" />
                            <div className="text-xs text-muted-foreground font-medium">Search nodes...</div>
                        </div>
                        <div className="max-h-64 overflow-y-auto custom-scrollbar">
                            {menuCategories.map((cat, idx) => (
                                <div key={idx} className="p-2">
                                    <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                                        {cat.title}
                                    </div>
                                    <div className="space-y-0.5 mt-1">
                                        {cat.items.map((item, i) => (
                                            <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group cursor-default">
                                                <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                                    <item.icon className="w-4 h-4 text-primary" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-xs font-semibold">{item.name}</div>
                                                    <div className="text-[10px] text-muted-foreground truncate">{item.desc}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30">
                <div className="bg-primary px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-white font-semibold transform hover:scale-105 transition-transform duration-200 cursor-default">
                    <Plus className="w-4 h-4" />
                    Add Node
                </div>
            </div>

            <AnimatedCursor x={cursorPos.x as any} y={cursorPos.y as any} label="Builder" color="#f97316" />

            <AnimatePresence>
                {showPulse && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0.5 }}
                        animate={{ scale: 4, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        className="absolute z-50 pointer-events-none w-10 h-10 rounded-full border-2 border-primary"
                        style={{
                            left: cursorPos.x,
                            top: cursorPos.y,
                            transform: 'translate(-50%, -50%)'
                        }}
                    />
                )}
            </AnimatePresence>


            <style jsx global>{`
                .react-flow__handle {
                    width: 8px;
                    height: 8px;
                    background: var(--primary);
                    border: 2px solid var(--background);
                }
                .react-flow__edge-path {
                    stroke-width: 2.5;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: var(--border);
                    border-radius: 10px;
                }
            `}</style>
        </div>
    )
}

export default function DemoCanvas(props: DemoCanvasProps) {
    return (
        <ReactFlowProvider>
            <DemoCanvasContent {...props} />
        </ReactFlowProvider>
    )
}
