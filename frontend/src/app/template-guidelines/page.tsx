"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, ArrowLeft, Lightbulb, Workflow, Settings, Activity } from "lucide-react"
import Image from "next/image"

export default function TemplateGuidelinesPage() {
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
                        <span>Template Guidelines</span>
                    </div>

                    <div className="flex-1 flex items-center justify-end gap-3">
                        <Button size="sm" asChild className="hidden md:flex">
                            <Link href="/workflows">
                                Use a Template
                            </Link>
                        </Button>
                        <Badge variant="outline" className="text-primary border-primary/50 whitespace-nowrap">v1.0.0</Badge>
                    </div>
                </div>
            </header>

            <div className="container flex-1 justify-center md:grid md:grid-cols-1 gap-6 px-4 md:px-8 max-w-5xl mx-auto">
                <main className="relative py-6 lg:gap-10 lg:py-8">
                    <div className="mx-auto w-full min-w-0 space-y-12">

                        <section id="introduction" className="space-y-4">
                            <h1 className="inline-block font-heading text-4xl lg:text-5xl font-bold tracking-tight">General Template Usage Guidelines</h1>
                            <p className="text-xl text-muted-foreground">
                                Workflow templates provide a rapid way to set up and deploy complex automations. Learn how to securely use and customize them for your own workspace.
                            </p>

                            <div className="grid gap-6 mt-8 md:grid-cols-2">
                                <Card className="border-primary/20 bg-primary/5">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Lightbulb className="text-primary h-5 w-5" />
                                            Why Use Templates?
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-muted-foreground">
                                        Templates abstract the complex logic of variable bindings, prompt engineering, and step configuration. They offer a known-good starting point that you can further customize to match your exact business logic.
                                    </CardContent>
                                </Card>

                                <Card className="border-primary/20 bg-primary/5">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Workflow className="text-primary h-5 w-5" />
                                            Seamless Integration
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-muted-foreground">
                                        When you instantiate a template, all nodes are created instantly in your dashboard. You only need to verify your trigger connections and provide your own secure API credentials.
                                    </CardContent>
                                </Card>
                            </div>
                        </section>

                        <section id="best-practices" className="space-y-4 pt-8 border-t">
                            <h2 className="text-3xl font-bold tracking-tight">Best Practices for Customization</h2>
                            <ul className="grid gap-4 list-none p-0">
                                <li className="flex gap-3">
                                    <div className="bg-primary/10 p-1 rounded-full h-fit mt-1">
                                        <div className="bg-primary h-2 w-2 rounded-full" />
                                    </div>
                                    <div>
                                        <span className="font-semibold block">Maintain Secure Credentials</span>
                                        <p className="text-muted-foreground">Templates never include API credentials. You will need to map your own secure AI, Slack, or webhook credentials via the node Dialog settings after instantiation.</p>
                                    </div>
                                </li>
                                <li className="flex gap-3">
                                    <div className="bg-primary/10 p-1 rounded-full h-fit mt-1">
                                        <div className="bg-primary h-2 w-2 rounded-full" />
                                    </div>
                                    <div>
                                        <span className="font-semibold block">Verify the Variable Bindings</span>
                                        <p className="text-muted-foreground">If you change the variable name of a node (e.g., from `{"{{geminiResponse}}"}` to `{"{{mySummary}}"}`), be sure to update any dependent nodes that reference it.</p>
                                    </div>
                                </li>
                                <li className="flex gap-3">
                                    <div className="bg-primary/10 p-1 rounded-full h-fit mt-1">
                                        <div className="bg-primary h-2 w-2 rounded-full" />
                                    </div>
                                    <div>
                                        <span className="font-semibold block">Adapt AI Prompts</span>
                                        <p className="text-muted-foreground">The AI prompts within templates are generalized. Add specific instructions regarding tone, style, and constraints to get the best results for your specific use cases.</p>
                                    </div>
                                </li>
                            </ul>
                        </section>

                        <section id="template-setup" className="space-y-8 pt-8 border-t pb-20">
                            <h2 className="text-3xl font-bold tracking-tight">Setup Checklist</h2>

                            <div className="space-y-6">
                                <h3 className="text-2xl font-semibold flex items-center gap-2">
                                    <Settings className="text-primary h-5 w-5" />
                                    Post-Deployment Steps
                                </h3>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 text-base">
                                                1. Select Template & Deploy
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="text-sm text-muted-foreground">
                                            Choose an active template from the canvas options. Once deployed, the workflow will be accessible immediately in your workspace as a disabled project.
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 text-base">
                                                2. Re-link Triggers
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="text-sm text-muted-foreground">
                                            For tools like Google Forms, ensure that your specific Webhook URL is applied and linked on the active application. Ensure that form field responses map correctly.
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 text-base">
                                                3. Supply Active API Keys
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="text-sm text-muted-foreground">
                                            Update the credentials on AI Nodes (OpenAI, Gemini, Anthropic) and messaging nodes (Slack, Discord). Ensure sufficient quota limits are active.
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 text-base">
                                                4. Test Run
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="text-sm text-muted-foreground">
                                            Trigger a manual execution before enabling it globally. Check the Execution logs to confirm the variables traverse from the trigger downwards cleanly.
                                        </CardContent>
                                    </Card>
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
