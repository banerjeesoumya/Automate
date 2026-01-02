"use client"

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import z from "zod";


const formSchema = z.object({
    variableName: z.string().min(1, { message: "Variable name is required" }).regex(/^[A-Za-z_$][A-Za-z0-9_$]*$/, { message: "Variable name must start with a letter, underscore, or dollar sign and contain only alphanumeric characters, underscores, or dollar signs" }),
    webhookUrl: z.string().min(1, { message: "Webhook URL must be a valid URL" }),
    content: z.string().min(1, { message: "Content is required" }).max(2000, { message: "Slack messages cannot exceed 2000 characters" }),
})

export type SlackFormValues = z.infer<typeof formSchema>;

interface SlackTriggerDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: z.infer<typeof formSchema>) => void;
    defaultValues?: Partial<SlackFormValues>
}

export const SlackTriggerDialog = ({ open, onOpenChange, onSubmit, defaultValues = {} }: SlackTriggerDialogProps) => {

    
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            variableName: defaultValues.variableName || "",
            webhookUrl: defaultValues.webhookUrl || "",
            content: defaultValues.content || "",
        },
    })

    useEffect(() => {
        if (open) {
            form.reset({
                variableName: defaultValues.variableName || "",
                webhookUrl: defaultValues.webhookUrl || "",
                content: defaultValues.content || "",
            })
        }
    }, [open, defaultValues, form])

    const watchVariableName = form.watch("variableName") || "responseData";
    
    const handleSubmit = (values: z.infer<typeof formSchema>) => {
        onSubmit(values);
        onOpenChange(false);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Slack Node Configuration</DialogTitle>
                    <DialogDescription>
                        Configure the Slack node settings here. Add webhook URL and message content as needed.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className="space-y-8 mt-4" 
                    >
                        <FormField
                            control={form.control}
                            name = "variableName"
                            render = {({ field }) => (
                                <FormItem>
                                    <FormLabel>Variable Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="responseData" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Use this name to reference the response data in subsequent nodes:{" "}
                                        {`{{${watchVariableName}.messageContent}}`}
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name = "webhookUrl"
                            render = {({ field }) => (
                                <FormItem>
                                    <FormLabel>Webhook URL</FormLabel>
                                        <FormControl>
                                            <Input placeholder="https://hooks.slack.com/services/..." {...field} />
                                        </FormControl>
                                    <FormDescription>
                                        The Slack webhook URL to send the message to. Get this from your Slack: Workspace Settings &rarr; Workflows &rarr; Webhooks.
                                    </FormDescription>
                                    <FormDescription>
                                        Make sure the "key" is "content" in the webhook settings.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name = "content"
                            render = {({ field }) => (
                                <FormItem>
                                    <FormLabel>Message Content</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            className="min-h-120[px] font-mono text-sm"
                                            placeholder="Summary: {{myGemini.text}}"
                                            {...field} 
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        The content of the message to send to the Discord channel. Use {"{{variables}}"} for simple values or {"{{json variable}}"} to stringify objects.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter className="mt-4">
                            <Button type="submit">Save</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}