"use client"

import { useAuthRedirect } from "@/hooks/useAuthRedirect"
import { useSuspenseTemplate, useUseTemplate } from "@/hooks/templates/use-templates"
import { use } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Lightbulb, Settings, Workflow } from "lucide-react"
import { TemplatesLoading } from "@/features/templates/components/templates"

export default function TemplateGuidePage({ params }: { params: Promise<{ templateId: string }> }) {
    const { isPending, user } = useAuthRedirect({ requireAuth: true })
    const resolvedParams = use(params)
    
    // Fetch template data
    // We only fetch if user is loaded to avoid errors
    if (isPending || !user) {
        return <TemplatesLoading />
    }

    return <TemplateGuideContent templateId={resolvedParams.templateId} />
}

function TemplateGuideContent({ templateId }: { templateId: string }) {
    const templateQuery = useSuspenseTemplate(templateId)
    const template = templateQuery.data
    const useTemplate = useUseTemplate()

    const formatNodeName = (name: string) => {
        if (!name) return "";
        if (name.toUpperCase() === "HTTP") return "HTTP";
        
        return name
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    };

    // Helper to find all variable usages like {{googleForm.responses.Name}} in the node data
    const extractVariables = (nodes: any[]) => {
        const variableRegex = /\{\{([^}]+)\}\}/g;
        const variables = new Set<string>();

        nodes.forEach((node) => {
            if (node.data) {
                const extractFromString = (str: string) => {
                    let match;
                    while ((match = variableRegex.exec(str)) !== null) {
                        variables.add(match[1].trim());
                    }
                };

                const traverse = (obj: any) => {
                    for (const key in obj) {
                        if (typeof obj[key] === "string") {
                            extractFromString(obj[key]);
                        } else if (typeof obj[key] === "object" && obj[key] !== null) {
                            traverse(obj[key]);
                        }
                    }
                };
                traverse(node.data);
            }
        });

        return Array.from(variables);
    };

    const usedVariables = template.nodes ? extractVariables(template.nodes) : [];

    return (
        <div className="flex min-h-[calc(100vh-80px)] flex-col bg-background relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-100 via-white to-zinc-100 dark:from-zinc-900 dark:via-black dark:to-zinc-900" />
            <div className="absolute top-20 left-20 w-72 h-72 bg-[#e78a53]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#e78a53]/5 rounded-full blur-3xl pointer-events-none" />

            <div className="container relative z-10 flex-1 justify-center md:grid md:grid-cols-1 gap-6 px-4 md:px-8 max-w-5xl mx-auto py-8">
                <main className="relative py-6 lg:gap-10">
                    <div className="mx-auto w-full min-w-0 space-y-12">
                        
                        {/* Header & Back Button */}
                        <div className="flex items-center gap-4 border-b border-border/40 pb-6 mb-8 flex-wrap">
                            <Button variant="ghost" size="sm" asChild className="gap-2 shrink-0">
                                <Link href="/templates">
                                    <ArrowLeft className="h-4 w-4" />
                                    Back to Templates
                                </Link>
                            </Button>
                            <div className="flex-1 flex justify-end gap-3 items-center">
                                <Badge variant="outline" className="capitalize text-primary border-primary/50">
                                    {template.category || "General Context"}
                                </Badge>
                                <Button 
                                    onClick={() => useTemplate.mutate(template.id)} 
                                    disabled={useTemplate.isPending}
                                >
                                    {useTemplate.isPending ? "Adding..." : "Use Template"}
                                </Button>
                            </div>
                        </div>

                        <section id="introduction" className="space-y-4">
                            <h1 className="inline-block font-heading text-4xl lg:text-5xl font-bold tracking-tight">
                                Guide: {template.title}
                            </h1>
                            <p className="text-xl text-muted-foreground max-w-[800px]">
                                {template.description}
                            </p>

                            <div className="grid gap-6 mt-8 md:grid-cols-2">
                                <Card className="border-primary/20 bg-background/60 backdrop-blur-sm">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Workflow className="text-primary h-5 w-5" />
                                            Required Nodes
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-muted-foreground flex flex-wrap gap-2">
                                        {template.nodes?.length > 0 ? (
                                            template.nodes.map((node: any) => (
                                                <Badge key={node.id} variant="secondary">
                                                    {formatNodeName(node.type || node.name)}
                                                </Badge>
                                            ))
                                        ) : (
                                            "No specific nodes identified."
                                        )}
                                    </CardContent>
                                </Card>

                                <Card className="border-primary/20 bg-background/60 backdrop-blur-sm">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Lightbulb className="text-primary h-5 w-5" />
                                            Why Use This?
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-muted-foreground">
                                        This template offers a proven foundation for automating "{template.title}". By using it, you can bypass manual node linking and focus immediately on prompt engineering and endpoint connections.
                                    </CardContent>
                                </Card>
                                
                                {usedVariables.length > 0 && (
                                    <Card className="border-primary/20 bg-background/60 backdrop-blur-sm md:col-span-2">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Settings className="text-primary h-5 w-5" />
                                                Expected Trigger Fields & Variables
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="text-muted-foreground space-y-4">
                                            <p className="text-sm">
                                                Based on the AI Prompts and message settings in this template, the workflow expects the following variables to be provided by the trigger (e.g., your Google Form or manual inputs):
                                            </p>
                                            <div className="flex flex-col gap-2">
                                                {usedVariables.map((variable, idx) => (
                                                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-2 bg-muted/30 p-3 rounded-md border border-border/50">
                                                        <code className="bg-primary/10 text-primary px-2 py-1 rounded-md text-sm font-mono whitespace-nowrap w-fit">
                                                            {"{{"}{variable}{"}}"}
                                                        </code>
                                                        <span className="text-sm">
                                                            → Ensure your trigger provides a field or output named exactly <strong className="text-foreground">{variable.split('.').pop()}</strong>.
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </section>

                        <section id="node-details" className="space-y-6 pt-8 border-t border-border/40">
                            <h2 className="text-3xl font-bold tracking-tight">Detailed Node Breakdown</h2>
                            <p className="text-muted-foreground text-lg">
                                Below is a detailed view of every node pre-configured in this template. Review these settings to understand exactly how the workflow processes your data.
                            </p>
                            
                            <div className="space-y-6">
                                {template.nodes?.map((node: any, index: number) => {
                                    const nodeName = formatNodeName(node.type || node.name);
                                    const isAiNode = ["gemini", "anthropic", "openai"].includes((node.type || "").toLowerCase());
                                    const isMessageNode = ["slack", "discord"].includes((node.type || "").toLowerCase());
                                    
                                    return (
                                        <Card key={node.id} className="overflow-hidden border-border/50 shadow-sm">
                                            <CardHeader className="bg-muted/30 pb-4 border-b border-border/30">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                                                        {index + 1}
                                                    </div>
                                                    <div>
                                                        <CardTitle className="text-lg flex items-center gap-2">
                                                            {nodeName} Node
                                                        </CardTitle>
                                                        <p className="text-sm text-muted-foreground mt-1">
                                                            {isAiNode && "Configured for AI-driven text analysis or generation."}
                                                            {isMessageNode && "Configured to send notifications or messages to your channels."}
                                                            {!isAiNode && !isMessageNode && "Handles triggering, logic, or integrations."}
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="pt-6 space-y-6">
                                                
                                                {/* Display AI Prompts */}
                                                {isAiNode && node.data && (
                                                    <div className="space-y-4">
                                                        {node.data.systemPrompt && (
                                                            <div className="space-y-2">
                                                                <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                                                    System Prompt
                                                                </h4>
                                                                <div className="bg-muted/30 rounded-md p-3 border border-border/40 text-sm text-muted-foreground whitespace-pre-wrap font-mono relative">
                                                                    {node.data.systemPrompt}
                                                                </div>
                                                                <p className="text-xs text-muted-foreground ml-3 border-l-2 border-muted pl-2">
                                                                    <strong>Purpose:</strong> Instructs the AI on its role, constraints, and the format it should use for outputting data.
                                                                </p>
                                                            </div>
                                                        )}
                                                        
                                                        {(node.data.userPrompt || node.data.prompt) && (
                                                            <div className="space-y-2">
                                                                <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                                                    User Prompt
                                                                </h4>
                                                                <div className="bg-muted/30 rounded-md p-3 border border-border/40 text-sm text-muted-foreground whitespace-pre-wrap font-mono relative">
                                                                    {node.data.userPrompt || node.data.prompt}
                                                                </div>
                                                                <p className="text-xs text-muted-foreground ml-3 border-l-2 border-muted pl-2">
                                                                    <strong>Purpose:</strong> The actual dynamic message sent to the AI. Notice the <code className="text-primary bg-primary/10 px-1 rounded">{"{{variables}}"}</code> used here to inject data from previous nodes.
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Display Message/Notification texts */}
                                                {isMessageNode && node.data && node.data.message && (
                                                    <div className="space-y-2">
                                                        <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                                                            Message Payload
                                                        </h4>
                                                        <div className="bg-muted/30 rounded-md p-3 border border-border/40 text-sm text-muted-foreground whitespace-pre-wrap font-mono relative">
                                                            {node.data.message}
                                                        </div>
                                                        <p className="text-xs text-muted-foreground ml-3 border-l-2 border-muted pl-2">
                                                            <strong>Purpose:</strong> The exact message template that will be dispatched. Variables like <code className="text-primary bg-primary/10 px-1 rounded">{"{{variables}}"}</code> populate this message with the AI's response or trigger data dynamically.
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Fallback for other config details */}
                                                {!isAiNode && !isMessageNode && node.data && Object.keys(node.data).length > 0 && (
                                                    <div className="space-y-2">
                                                        <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                                                            <Settings className="w-4 h-4 text-muted-foreground" />
                                                            Key Pre-configured Data
                                                        </h4>
                                                        <div className="bg-muted/30 rounded-md p-3 border border-border/40 text-sm font-mono overflow-x-auto text-muted-foreground">
                                                            <pre>{JSON.stringify(node.data, null, 2)}</pre>
                                                        </div>
                                                    </div>
                                                )}

                                                {(!node.data || Object.keys(node.data).length === 0) && (
                                                    <p className="text-sm text-muted-foreground italic">No specific pre-configuration payload for this node.</p>
                                                )}

                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        </section>

                        <section id="setup-checklist" className="space-y-8 pt-8 border-t border-border/40 pb-20">
                            <h2 className="text-3xl font-bold tracking-tight">Configuration Checklist</h2>

                            <div className="space-y-6">
                                <h3 className="text-xl font-semibold flex items-center gap-2">
                                    <Settings className="text-primary h-5 w-5" />
                                    Post-Deployment Steps for {template.title}
                                </h3>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <Card className="bg-background/60 backdrop-blur-sm">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 text-base">
                                                1. Instantiate Workflow
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="text-sm text-muted-foreground">
                                            Click the "Use Template" button at the top to copy this configuration directly into your workflows dashboard as an editable project.
                                        </CardContent>
                                    </Card>
                                    <Card className="bg-background/60 backdrop-blur-sm">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 text-base">
                                                2. Remap Application Nodes
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="text-sm text-muted-foreground">
                                            Check triggers like Webhooks or Google Form modules. Ensure that you replace placeholder paths with your live endpoint variables.
                                        </CardContent>
                                    </Card>
                                    <Card className="bg-background/60 backdrop-blur-sm">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 text-base">
                                                3. Map Secure API Keys
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="text-sm text-muted-foreground">
                                            Templates are sanitized. For every AI, Slack or database node in this flow, you must open its Settings tab and select your own personal API Keys.
                                        </CardContent>
                                    </Card>
                                    <Card className="bg-background/60 backdrop-blur-sm">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 text-base">
                                                4. Refine AI Prompts
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="text-sm text-muted-foreground">
                                            The system prompts inside AI nodes in this template are generalized. Modify them to include your specific application's context, voice, and rules.
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </section>
                    </div>
                </main>
            </div>
        </div>
    )
}
