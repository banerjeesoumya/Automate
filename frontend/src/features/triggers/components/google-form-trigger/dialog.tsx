"use client"

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BACKEND_URL } from "@/lib/api";
import { generateGoogleFormScript } from "@/lib/utils";
import { CopyIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";

interface ManualTriggerDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const GoogleFormTriggerDialog = ({ open, onOpenChange }: ManualTriggerDialogProps) => {
    const params = useParams();
    const workflowId = params.workflowId as string;

    const baseUrl = BACKEND_URL.replace("/api", "");
    const webhookUrl = `${baseUrl}/api/webhooks/google-form?workflowId=${workflowId}`;

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(webhookUrl);
            toast.success("Webhook URL copied to clipboard");
        } catch {
            toast.error("Failed to copy webhook URL");
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Google Form Trigger</DialogTitle>
                    <DialogDescription>
                        Use this webhook URL in your Google Form's Apps Script to trigger the workflow upon form submission.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="webhook-url">
                            Webhook URL
                        </Label>
                        <div className="flex gap-2">
                            <Input
                                id="webhook-url"
                                value={webhookUrl}
                                readOnly
                                className="font-mono text-sm" 
                            />
                            <Button type="button" size="icon" variant="outline" onClick={copyToClipboard}>
                                <CopyIcon className="size-4"/>
                            </Button>
                        </div>
                    </div>
                    <div className="rounded-lg bg-muted p-4 space-y-2">
                        <h4 className="font-medium test-sm">
                            Setup Instructions:
                        </h4>
                        <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1">
                            <li>Open your Google Form.</li>
                            <li>Click on the three dots (More) in the top-right corner and select "Script editor".</li>
                            <li>In the Apps Script editor, replace any existing code with the following script:</li>
                            <li>Replace the WEBHOOK_URL placeholder in the script with the webhook URL above.</li>
                            <li>Save and click "Triggers" &rarr; Add Trigger to create a new trigger.</li>
                            <li>Choose: From form &rarr; On form submit &rarr; Save.</li>
                        </ol>
                    </div>
                    <div className="rounded-lg bg-muted p-4 space-y-3">
                        <h4 className="font-medium text-sm">
                            Google Apps Script:
                        </h4>
                        <Button type="button" variant="outline" onClick={async () => {
                            const script = generateGoogleFormScript(webhookUrl);
                            try {
                                await navigator.clipboard.writeText(script);
                                toast.success("Google Apps Script copied to clipboard");
                            } catch (error) {
                                toast.error("Failed to copy Google Apps Script");
                            }
                        }}>
                            <CopyIcon className="size-4 mr-2"/>
                            Copy Google Apps Script
                        </Button>
                        <p className="text-xs test-muted-foreground">
                            This script captures form submissions and sends the data to the specified webhook URL.
                        </p>
                    </div>
                    <div className="rounded-lg bg-muted p-4 space-y-2">
                        <h4 className="font-medium text-sm">
                            Availabe Variables
                        </h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                            <li>
                                <code className="bg-background px-1 py-0.5 rounded">
                                    {"{{googleForm.respondentEmail}}"}
                                </code>
                                : The email address of the form respondent (if collected).
                            </li>
                            <li>
                                <code className="bg-background px-1 py-0.5 rounded">
                                    {"{{googleForm.responses.['Question Name']}}"}
                                </code>
                                : The response to the specified question in the form.
                            </li>
                            <li>
                                <code className="bg-background px-1 py-0.5 rounded">
                                    {"{{json googleForm.responses}}"}
                                </code>
                                : All form responses in JSON format.
                            </li>
                        </ul>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}