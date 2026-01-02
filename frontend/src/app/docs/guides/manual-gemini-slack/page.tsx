"use client"

import dynamic from "next/dynamic"
import { DocsSidebar } from "../../../../features/docs/components/docs-sidebar"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Info, ArrowLeft } from "lucide-react"
import Image from "next/image"
import { NodeType } from "@/lib/utils"

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
            id: "manual",
            type: NodeType.Manual_Trigger,
            position: { x: -300, y: 0 },
            data: { variableName: "trigger" }
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
            id: "gemini",
            type: NodeType.GEMINI,
            position: { x: 50, y: 0 },
            data: { variableName: "ai" }
        }
    },
    { type: "SHOW_MENU", visible: false },
    { type: "WAIT", ms: 800 },
    { type: "MOVE", x: 30, y: 45 }, 
    { type: "CLICK" },
    { type: "CONNECT", edge: { id: "e1-2", source: "manual", target: "gemini", animated: true } },
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
            id: "slack",
            type: NodeType.SLACK,
            position: { x: 400, y: 0 },
            data: { variableName: "slack" }
        }
    },
    { type: "SHOW_MENU", visible: false },
    { type: "WAIT", ms: 800 },
    { type: "MOVE", x: 55, y: 45 }, 
    { type: "CLICK" },
    { type: "CONNECT", edge: { id: "e2-3", source: "gemini", target: "slack", animated: true } },
    { type: "WAIT", ms: 2000 },
]

export default function ManualGeminiSlackGuide() {
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
                            <Badge variant="outline" className="text-primary border-primary/50">Guide</Badge>
                            <h1 className="text-4xl font-bold tracking-tight">Manual {"->"} Gemini {"->"} Slack</h1>
                            <p className="text-xl text-muted-foreground">
                                Learn how to trigger a workflow manually, process data with AI, and send the result to Slack.
                            </p>
                        </div>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-semibold">Workflow Demo</h2>
                            <DemoCanvas script={demoScript as any} />
                        </section>


                        <section className="space-y-6">
                            <h2 className="text-2xl font-semibold">Setup Instructions</h2>

                            <div className="space-y-4">
                                <div className="flex gap-4 items-start">
                                    <div className="bg-primary/10 p-2 rounded-lg text-primary font-bold">1</div>
                                    <div className="space-y-2">
                                        <h3 className="font-semibold text-lg">Configure Manual Trigger</h3>
                                        <p className="text-muted-foreground">Add a Manual Trigger node. This allows you to start the workflow with a click from the dashboard. Set a variable name (e.g., <code className="bg-muted px-1 rounded">trigger</code>) to reference any input data.</p>
                                    </div>
                                </div>

                                <div className="flex gap-4 items-start">
                                    <div className="bg-primary/10 p-2 rounded-lg text-primary font-bold">2</div>
                                    <div className="space-y-2">
                                        <h3 className="font-semibold text-lg">Add Gemini Node</h3>
                                        <p className="text-muted-foreground">Connect the Manual Trigger to a Gemini node. In the prompt field, use <code className="bg-muted px-1 rounded">{"{{json trigger}}"}</code> to pass the trigger data to the AI. Ensure you have configured your Gemini API key in the Credentials section.</p>
                                    </div>
                                </div>

                                <div className="flex gap-4 items-start">
                                    <div className="bg-primary/10 p-2 rounded-lg text-primary font-bold">3</div>
                                    <div className="space-y-2">
                                        <h3 className="font-semibold text-lg">Connect Slack Output</h3>
                                        <p className="text-muted-foreground">Finish the workflow by connecting the Gemini node to a Slack node. Use the variable <code className="bg-muted px-1 rounded">{"{{ai.text}}"}</code> in the Slack message content to send the AI's response to your channel.</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <div className="bg-muted/50 p-6 rounded-xl border border-primary/20 flex gap-4">
                            <Info className="text-primary h-6 w-6 shrink-0 mt-1" />
                            <div className="space-y-2">
                                <h4 className="font-semibold">Pro Tip: Testing</h4>
                                <p className="text-sm text-muted-foreground">
                                    Use the "Execute" button in the editor to run this workflow instantly and check the execution logs for any errors in prompt formatting.
                                </p>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}
