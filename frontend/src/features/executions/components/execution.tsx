"use client"

import { useState } from "react";
import { CheckCircle2, CheckCircle2Icon, ClockIcon, Loader2Icon, XCircleIcon } from "lucide-react";   
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ExecutionStatus } from "@/lib/utils";
import { useSuspenseExecution } from "@/hooks/executions/use-executions";


const getStatusIcon = (status: ExecutionStatus) => {
    switch (status) {
        case ExecutionStatus.COMPLETE:
            return <CheckCircle2Icon className="text-green-600 size-5" />;
        case ExecutionStatus.ERRORED:
            return <XCircleIcon className="text-red-600 size-5" />;
        case ExecutionStatus.RUNNING:
            return <Loader2Icon className="text-blue-600 size-5 animate-spin" />;
        default:
            return <ClockIcon className="size-5 text-muted-foreground" />;
    }
}

const formatStatus = (status: ExecutionStatus) => {
    return status.charAt(0) + status.slice(1).toLowerCase();  
}

export const ExecutionView = ({
    executionId
} : { executionId: string } ) => {
    const { data: execution } = useSuspenseExecution(executionId);
    const [showStackTrace, setShowStackTrace] = useState(false);

    const duration = execution.execution.completedAt ? Math.round((new Date(execution.execution.completedAt).getTime() - new Date(execution.execution.startedAt).getTime()) / 1000) : null;
    
    return (
        <Card className="shadow-none">
            <CardHeader>
                <div className="flex items-center gap-3">
                    {getStatusIcon(execution.execution.status)}
                    <div>
                        <CardTitle>
                            {formatStatus(execution.execution.status)}
                        </CardTitle>
                        <CardDescription>
                            Execution for {execution.execution.workflow.name}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">
                            Workflow
                        </p>
                        <Link
                            prefetch
                            className="text-sm hover:underline text-primary"
                            href={`/workflows/${execution.execution.workflowId}`}
                        >
                            {execution.execution.workflow.name}
                        </Link>
                    </div>

                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Status</p>
                        <p className="text-sm">{formatStatus(execution.execution.status)}</p>
                    </div>

                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Started</p>
                        <p className="text-sm">{formatDistanceToNow(execution.execution.startedAt, { addSuffix: true})}</p>
                    </div>

                    {execution.execution.completedAt ? (
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Completed</p>
                            <p className="text-sm">{formatDistanceToNow(execution.execution.completedAt, { addSuffix: true})}</p>
                        </div>
                    ) : null}

                    {duration !== null ? (
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Duration</p>
                            <p className="text-sm">{duration} secs</p>
                        </div>
                    ) : null}

                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Event ID</p>
                        <p className="text-sm">{execution.execution.cloudflareWorkflowId}</p>
                    </div>
                </div>

                {execution.execution.error && (
                    <div className="mt-6 p-4 bg-red-50 rounded-md space-y-3">
                        <div>
                            <p className="text-sm font-medium text-red-900 mb-2">
                                Error
                            </p>
                            <p className="text-sm text-red-800 font-mono break-all whitespace-pre-wrap">
                                {execution.execution.error}
                            </p>

                        </div>
                        {execution.execution.errorStack && (
                            <Collapsible
                                open={showStackTrace}
                                onOpenChange={setShowStackTrace}
                            >
                                <CollapsibleTrigger asChild>
                                    <Button variant="ghost" size="sm" className="text-red-900 hover:bg-red-100">
                                        {showStackTrace ? "Hide Stack Trace" : "Show Stack Trace"}
                                    </Button>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <pre className="text-xs font-mono text-red-800 overflow-auto mt-2 p-2 bg-red-100 rounded">
                                        {execution.execution.errorStack}
                                    </pre>
                                </CollapsibleContent>
                            </Collapsible>
                        )}
                    </div>
                )}

                {execution.execution.logs && (
                    <div className="mt-6 p-4 bg-muted rounded-md">
                        <p className="text-sm font-medium mb-2">Execution Logs</p>
                        <pre className="text-xs font-mono overflow-auto">
                            {JSON.stringify(execution.execution.logs, null, 2)}
                        </pre>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}