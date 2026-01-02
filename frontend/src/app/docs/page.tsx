"use client"

import { DocsSidebar } from "../../features/docs/components/docs-sidebar"
import dynamic from "next/dynamic"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ExternalLink, Info, Zap, Cpu, MessageSquare, Globe, ArrowLeft } from "lucide-react"
import Image from "next/image"
import { NodeType } from "@/lib/utils"

const DemoCanvas = dynamic(() => import("../../features/docs/components/demo-canvas"), { ssr: false })

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
            id: "trigger",
            type: NodeType.GOOGLE_FORM_TRIGGER,
            position: { x: -300, y: 0 },
            data: { variableName: "form", formTitle: "Support Request" }
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
            id: "ai",
            type: NodeType.GEMINI,
            position: { x: 50, y: 0 },
            data: { variableName: "aiSummary", userPrompt: "Summarize: {{form.responses}}" }
        }
    },
    { type: "SHOW_MENU", visible: false },
    { type: "WAIT", ms: 800 },
    { type: "MOVE", x: 30, y: 45 },
    { type: "CLICK" },
    { type: "CONNECT", edge: { id: "e1-2", source: "trigger", target: "ai", animated: true } },
    { type: "WAIT", ms: 1200 },
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
            data: { variableName: "slack", content: "Summary: {{aiSummary.text}}" }
        }
    },
    { type: "SHOW_MENU", visible: false },
    { type: "WAIT", ms: 800 },
    { type: "MOVE", x: 55, y: 45 },
    { type: "CLICK" },
    { type: "CONNECT", edge: { id: "e2-3", source: "ai", target: "slack", animated: true } },
    { type: "WAIT", ms: 2000 },
]

export default function DocsPage() {
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
                        <Image src="/logo.svg" alt="Automate Logo" width={40} height={40} />
                        <span>Automate Docs</span>
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
                    <div className="mx-auto w-full min-w-0 max-w-4xl space-y-12">

                        <section id="what-is-automate" className="space-y-4">
                            <h1 className="inline-block font-heading text-4xl lg:text-5xl font-bold tracking-tight">Introduction</h1>
                            <p className="text-xl text-muted-foreground">
                                Automate is a powerful visual workflow engine designed to turn complex, manual processes into repeatable, edge-powered automations.
                            </p>

                            <div className="grid gap-6 mt-8 md:grid-cols-2">
                                <Card className="border-primary/20 bg-primary/5">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Zap className="text-primary h-5 w-5" />
                                            What is Automate?
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-muted-foreground">
                                        Automate allows you to connect triggers (like Google Form submissions), AI processing steps (using Gemini, GPT-4, etc.), and delivery nodes (Slack, Discord, HTTP) into a single, cohesive workflow.
                                    </CardContent>
                                </Card>

                                <Card className="border-primary/20 bg-primary/5">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Cpu className="text-primary h-5 w-5" />
                                            The Goal
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-muted-foreground">
                                        Our goal is to democratize automation by providing a visual, no-code/low-code interface that is backed by enterprise-grade infrastructure. We make it easy to weave AI into your existing products.
                                    </CardContent>
                                </Card>
                            </div>
                        </section>

                        <section id="why-automate" className="space-y-4 pt-8 border-t">
                            <h2 className="text-3xl font-bold tracking-tight">Why Automate?</h2>
                            <ul className="grid gap-4 list-none p-0">
                                <li className="flex gap-3">
                                    <div className="bg-primary/10 p-1 rounded-full h-fit mt-1">
                                        <div className="bg-primary h-2 w-2 rounded-full" />
                                    </div>
                                    <div>
                                        <span className="font-semibold block">Edge-Powered Performance</span>
                                        <p className="text-muted-foreground">Your workflows run on the edge, ensuring ultra-low latency execution across the globe.</p>
                                    </div>
                                </li>
                                <li className="flex gap-3">
                                    <div className="bg-primary/10 p-1 rounded-full h-fit mt-1">
                                        <div className="bg-primary h-2 w-2 rounded-full" />
                                    </div>
                                    <div>
                                        <span className="font-semibold block">Built-in AI Orchestration</span>
                                        <p className="text-muted-foreground">Seamlessly switch between OpenAI, Gemini, and Anthropic nodes without writing a single line of API boilerplate.</p>
                                    </div>
                                </li>
                                <li className="flex gap-3">
                                    <div className="bg-primary/10 p-1 rounded-full h-fit mt-1">
                                        <div className="bg-primary h-2 w-2 rounded-full" />
                                    </div>
                                    <div>
                                        <span className="font-semibold block">Secure Credential Management</span>
                                        <p className="text-muted-foreground">Store your API keys once in our encrypted vault and use them across all your workflows securely.</p>
                                    </div>
                                </li>
                            </ul>
                        </section>

                        <section id="triggers" className="space-y-8 pt-8 border-t">
                            <h2 className="text-3xl font-bold tracking-tight">Nodes Reference</h2>

                            <div className="space-y-6">
                                <h3 className="text-2xl font-semibold flex items-center gap-2">
                                    <Info className="text-primary h-5 w-5" />
                                    Triggers
                                </h3>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Image src="/googleform.svg" alt="Google Forms" width={20} height={20} />
                                                Google Form Trigger
                                            </CardTitle>
                                            <CardDescription>Triggers when a response is submitted.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="text-sm">
                                            <strong>Configuration:</strong> Provide the Google Form ID. Use the provided Apps Script to link the form to Automate's webhook.
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Zap className="text-primary/70 h-5 w-5" />
                                                Manual Trigger
                                            </CardTitle>
                                            <CardDescription>Manually trigger from the dashboard.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="text-sm">
                                            <strong>Configuration:</strong> No special settings required. Perfect for testing your workflow before deploying triggers.
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>

                            <div id="ai-nodes" className="space-y-6 pt-6">
                                <h3 className="text-2xl font-semibold flex items-center gap-2">
                                    <Cpu className="text-primary h-5 w-5" />
                                    AI Nodes
                                </h3>
                                <div className="grid gap-4 md:grid-cols-3">
                                    <Card>
                                        <CardHeader className="p-4">
                                            <CardTitle className="flex items-center gap-2 text-base">
                                                <Image src="/openai.svg" alt="OpenAI" width={16} height={16} />
                                                OpenAI
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
                                            <strong>Settings:</strong> System Prompt, User Prompt, Model Selector. Requires OpenAI API Credential.
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader className="p-4">
                                            <CardTitle className="flex items-center gap-2 text-base">
                                                <Image src="/gemini.svg" alt="Gemini" width={16} height={16} />
                                                Google Gemini
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
                                            <strong>Settings:</strong> Prompt input and variable support. Optimized for long-context tasks.
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader className="p-4">
                                            <CardTitle className="flex items-center gap-2 text-base">
                                                <Image src="/anthropic.svg" alt="Anthropic" width={16} height={16} />
                                                Anthropic (Claude)
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
                                            <strong>Settings:</strong> Claude-specific prompt formatting and token control.
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>

                            <div id="communication-nodes" className="space-y-6 pt-6">
                                <h3 className="text-2xl font-semibold flex items-center gap-2">
                                    <MessageSquare className="text-primary h-5 w-5" />
                                    Communication
                                </h3>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Image src="/slack.svg" alt="Slack" width={20} height={20} />
                                                Slack
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="text-sm">
                                            <strong>Configuration:</strong> Webhook URL and Message Content. Supports template variables for dynamic messages.
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Image src="/discord.svg" alt="Discord" width={20} height={20} />
                                                Discord
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="text-sm">
                                            <strong>Configuration:</strong> Discord Webhook URL. Format messages with rich markdown support.
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </section>

                        <section id="interactive-canvas" className="space-y-4 pt-8 border-t">
                            <h2 className="text-3xl font-bold tracking-tight">Interactive Canvas</h2>
                            <p className="text-muted-foreground">
                                Watch how easy it is to build a support automation flow from scratch:
                            </p>

                            <DemoCanvas script={demoScript as any} />


                            <div className="bg-muted p-4 rounded-lg border flex gap-4 mt-6">
                                <div className="bg-primary/20 p-2 rounded-full h-fit">
                                    <Info className="text-primary h-5 w-5" />
                                </div>
                                <div>
                                    <h4 className="font-semibold">How to Link Nodes:</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Simply drag a connection from the "Source" handle of one node to the "Target" handle of another. Connections represent the flow of data and execution priority.
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section id="linking-nodes" className="space-y-6 pt-8 border-t pb-20">
                            <h2 className="text-3xl font-bold tracking-tight">Linking and Variables</h2>
                            <div className="space-y-4">
                                <p>
                                    Data flows between nodes using a <strong>Variable System</strong>. Each node has a "Variable Name" property which you can use to reference its output later.
                                </p>

                                <h4 id="variable-system" className="font-semibold text-lg">Variable Syntax:</h4>
                                <div className="bg-zinc-950 p-4 rounded-md font-mono text-zinc-300 border border-zinc-800 shadow-xl">
                                    <div className="text-primary mb-2"># Accessing a simple field</div>
                                    <div>{"{{"} variableName.id {"}}"}</div>

                                    <div className="text-primary mb-2 mt-4"># Accessing nested objects (e.g. Gemini response)</div>
                                    <div>{"{{"} myGemini.text {"}}"}</div>

                                    <div className="text-primary mb-2 mt-4"># Stringifying objects as JSON</div>
                                    <div>{"{{"} json httpResponse.data {"}}"}</div>
                                </div>

                                <div className="mt-8">
                                    <h4 className="font-semibold text-lg">Entire Setup Checklist:</h4>
                                    <ul className="list-disc pl-6 space-y-2 mt-2 text-muted-foreground">
                                        <li>Create a new workflow in the dashboard.</li>
                                        <li>Add a Trigger node (Manual or Google Form).</li>
                                        <li>Configure Credentials in the "Settings" tab for AI nodes.</li>
                                        <li>Link nodes together following your logic.</li>
                                        <li>Hit "Run" to test or "Enable" to make it live.</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                    </div>
                </main>
            </div>

            <footer className="border-t py-12 bg-muted/30">
                <div className="container px-4 text-center text-muted-foreground text-sm">
                    <p>© 2026 Automate Platform. Powered by Edge Computing.</p>
                </div>
            </footer>
        </div>
    )
}
