"use client"

import dynamic from "next/dynamic"
import { DocsSidebar } from "../../../../features/docs/components/docs-sidebar"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Info, Zap, Globe, Link2, Code, ArrowLeft } from "lucide-react"
import Image from "next/image"
import { NodeType } from "@/lib/utils"
import type { Node, Edge } from "@xyflow/react"

const DemoCanvas = dynamic(() => import("../../../../features/docs/components/demo-canvas"), { ssr: false })

const demoScript = [
    { type: "MOVE", x: 50, y: 90 },
    { type: "CLICK" },
    { type: "SHOW_MENU", visible: true },
    { type: "WAIT", ms: 800 },
    { type: "MOVE", x: 50, y: 70 },
    { type: "CLICK" },
    {
        type: "ADD_NODE",
        node: {
            id: "start",
            type: NodeType.Manual_Trigger,
            position: { x: -300, y: 0 },
            data: { variableName: "start" }
        }
    },
    { type: "SHOW_MENU", visible: false },
    { type: "WAIT", ms: 1000 },
    { type: "MOVE", x: 50, y: 90 },
    { type: "CLICK" },
    { type: "SHOW_MENU", visible: true },
    { type: "WAIT", ms: 800 },
    { type: "MOVE", x: 50, y: 75 },
    { type: "CLICK" },
    {
        type: "ADD_NODE",
        node: {
            id: "auth",
            type: NodeType.HTTP_Request,
            position: { x: 50, y: 0 },
            data: { variableName: "authRequest", method: "POST", endpoint: "https://api.example.com/login" }
        }
    },
    { type: "SHOW_MENU", visible: false },
    { type: "WAIT", ms: 800 },
    { type: "MOVE", x: 34, y: 45 }, 
    { type: "CLICK" },
    { type: "CONNECT", edge: { id: "e1-2", source: "start", target: "auth", animated: true } },
    { type: "WAIT", ms: 1000 },
    { type: "MOVE", x: 50, y: 90 },
    { type: "CLICK" },
    { type: "SHOW_MENU", visible: true },
    { type: "WAIT", ms: 800 },
    { type: "MOVE", x: 50, y: 80 },
    { type: "CLICK" },
    {
        type: "ADD_NODE",
        node: {
            id: "data",
            type: NodeType.HTTP_Request,
            position: { x: 400, y: 0 },
            data: { variableName: "fetchData", method: "GET", endpoint: "https://api.example.com/data" }
        }
    },
    { type: "SHOW_MENU", visible: false },
    { type: "WAIT", ms: 800 },
    { type: "MOVE", x: 52, y: 45 }, 
    { type: "CLICK" },
    { type: "CONNECT", edge: { id: "e2-3", source: "auth", target: "data", animated: true } },
    { type: "WAIT", ms: 2000 },
]

export default function ManualHttpHttpGuide() {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-14 items-center gap-4 px-4 md:px-8">
                    <div className="flex-1 flex items-center justify-start">
                        <Button variant="ghost" size="sm" asChild className="gap-2">
                            <Link href="/">
                                <ArrowLeft className="h-4 w-4" />
                                <span className="hidden sm:inline">Back to Home</span>
                            </Link>
                        </Button>
                    </div>

                    <div className="flex items-center gap-2 font-bold text-xl text-primary">
                        <Image src="/logo.svg" alt="Automate Logo" width={32} height={32} />
                        <span className="hidden xs:inline">Automate Docs</span>
                    </div>

                    <div className="flex-1 flex items-center justify-end gap-3">
                        <Button size="sm" asChild className="hidden md:flex">
                            <Link href="/workflows">
                                Start Building
                            </Link>
                        </Button>
                        <Badge variant="outline" className="text-primary border-primary/50 whitespace-nowrap">v1.0.0</Badge>
                    </div>
                </div>
            </header>

            <div className="container flex-1 items-start md:grid md:grid-cols-[240px_minmax(0,1fr)] lg:grid-cols-[280px_minmax(0,1fr)] gap-6 px-4 md:px-8">
                <DocsSidebar />
                <main className="relative py-6 lg:gap-10 lg:py-8">
                    <div className="mx-auto w-full min-w-0 max-w-4xl space-y-8">
                        <div className="space-y-2">
                            <Badge variant="outline" className="text-primary border-primary/50">Advanced Guide</Badge>
                            <h1 className="text-4xl font-bold tracking-tight">Chaining HTTP Requests</h1>
                            <p className="text-xl text-muted-foreground">
                                Learn how to chain multiple API calls together, using the output of the first as an input for the second.
                            </p>
                        </div>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-semibold">Workflow Demo</h2>
                            <DemoCanvas script={demoScript as any} />
                        </section>


                        <section className="space-y-6">
                            <h2 className="text-2xl font-semibold">Chaining Logic</h2>

                            <div className="grid gap-6 md:grid-cols-2">
                                <Card className="bg-primary/5 border-primary/20">
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Zap className="h-5 w-5 text-primary" />
                                            Step 1: Authentication
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-sm text-muted-foreground">
                                        The first HTTP node sends a <code className="bg-muted px-1 rounded">POST</code> request to an auth endpoint.
                                        We set the Variable Name to <code className="bg-muted px-1 rounded">authRequest</code>.
                                    </CardContent>
                                </Card>

                                <Card className="bg-primary/5 border-primary/20">
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Link2 className="h-5 w-5 text-primary" />
                                            Step 2: Data Retrieval
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-sm text-muted-foreground">
                                        The second HTTP node uses the token received in Step 1.
                                        The endpoint becomes: <code className="bg-muted px-1 rounded">.../data?token={"{{authRequest.token}}"}</code>.
                                    </CardContent>
                                </Card>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-semibold flex items-center gap-2">
                                <Code className="h-6 w-6 text-primary" />
                                Variable Resolution
                            </h2>
                            <p className="text-muted-foreground">
                                When chaining HTTP nodes, Automate automatically parses the JSON response of the previous node. You can access any nested property using standard dot notation within double curly braces.
                            </p>
                            <div className="bg-zinc-950 p-6 rounded-xl border border-zinc-800 font-mono text-sm space-y-2">
                                <div className="text-zinc-500">// Response from 'authRequest'</div>
                                <div className="text-zinc-300">{"{"} "token": "abc-123", "expires": 3600 {"}"}</div>
                                <div className="h-px bg-zinc-800 my-4" />
                                <div className="text-zinc-500">// Referencing in next node</div>
                                <div className="text-primary">{"{{"} authRequest.token {"}}"} <span className="text-zinc-500"> &rarr; resolver to "abc-123"</span></div>
                            </div>
                        </section>

                        <div className="bg-muted p-4 rounded-lg flex gap-4">
                            <Info className="text-primary h-5 w-5 shrink-0" />
                            <p className="text-sm text-muted-foreground italic">
                                Chaining can be extended indefinitely. You can even use AI nodes in between HTTP calls to transform data!
                            </p>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}
