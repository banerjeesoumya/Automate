"use client"

import dynamic from "next/dynamic"
import { DocsSidebar } from "../../../../features/docs/components/docs-sidebar"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Info, Zap, MessageSquare, ListTodo, ExternalLink, ArrowLeft } from "lucide-react"
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
            id: "form",
            type: NodeType.GOOGLE_FORM_TRIGGER,
            position: { x: -200, y: 0 },
            data: { variableName: "form", formTitle: "Registration Form" }
        }
    },
    { type: "SHOW_MENU", visible: false },
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
            position: { x: 200, y: 0 },
            data: { variableName: "slack", content: "New registration: {{json form.responses}}" }
        }
    },
    { type: "SHOW_MENU", visible: false },
    { type: "WAIT", ms: 800 },
    { type: "MOVE", x: 38, y: 45 }, 
    { type: "CLICK" },
    { type: "CONNECT", edge: { id: "e1-2", source: "form", target: "slack", animated: true } },
    { type: "WAIT", ms: 2000 },
]

export default function GoogleFormSlackGuide() {
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
                            <h1 className="text-4xl font-bold tracking-tight">Google Form {"->"} Slack</h1>
                            <p className="text-xl text-muted-foreground">
                                Automate notifications for new Google Form submissions directly to your Slack channel.
                            </p>
                        </div>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-semibold">Workflow Demo</h2>
                            <DemoCanvas script={demoScript as any} />
                        </section>


                        <section className="space-y-6">
                            <h2 className="text-2xl font-semibold">Detailed Steps</h2>

                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <h3 className="text-xl font-semibold flex items-center gap-2">
                                        <Image src="/googleform.svg" alt="Google Forms" width={24} height={24} />
                                        1. Setting up the Google Form Trigger
                                    </h3>
                                    <p className="text-muted-foreground">
                                        Add the Google Form node to your canvas. You'll need to copy the <strong>Webhook URL</strong> generated by the node to use in your Google Form script.
                                    </p>
                                    <div className="bg-muted p-4 rounded-lg border">
                                        <h4 className="font-semibold mb-2 flex items-center gap-2 text-sm uppercase">Apps Script Setup:</h4>
                                        <ol className="list-decimal pl-6 space-y-2 text-sm text-muted-foreground">
                                            <li>Open your Google Form.</li>
                                            <li>Click the three dots &rarr; <strong>Script editor</strong>.</li>
                                            <li>Paste the code provided in the Automate node configuration.</li>
                                            <li>Update the <code className="bg-background px-1 rounded">WEBHOOK_URL</code> variable with your node's URL.</li>
                                            <li>Add a trigger in the script editor for "On form submit".</li>
                                        </ol>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-xl font-semibold flex items-center gap-2">
                                        <Image src="/slack.svg" alt="Slack" width={24} height={24} />
                                        2. Connecting to Slack
                                    </h3>
                                    <p className="text-muted-foreground">
                                        Drag a connection from the Form node to a Slack node. In the Slack node settings:
                                    </p>
                                    <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                        <li>Enter your Slack Incoming Webhook URL.</li>
                                        <li>Use <code className="bg-muted px-1 rounded">{"{{json form.responses}}"}</code> to send all form fields as a JSON object, or reference specific fields like <code className="bg-muted px-1 rounded">{"{{form.responses.Email}}"}</code>.</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        <div className="bg-zinc-950 p-6 rounded-xl border border-zinc-800 shadow-2xl space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="text-zinc-400 text-sm font-mono uppercase tracking-widest leading-none">Apps Script Snippet</h4>
                                <ExternalLink className="text-zinc-600 h-4 w-4" />
                            </div>
                            <pre className="text-xs text-zinc-300 overflow-x-auto font-mono">
                                {
                                    `function onFormSubmit(e) {
                                        var payload = {
                                            responses: e.response.getItemResponses().reduce((acc, r) => {
                                            acc[r.getItem().getTitle()] = r.getResponse();
                                            return acc;
                                            }, {})
                                        };
                                        UrlFetchApp.fetch('YOUR_WEBHOOK_URL', {
                                            method: 'post',
                                            contentType: 'application/json',
                                            payload: JSON.stringify(payload)
                                        });
                                    }`
                                }
                            </pre>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}
