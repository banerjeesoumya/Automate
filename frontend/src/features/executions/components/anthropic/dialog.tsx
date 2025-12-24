"use client"

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useSuspenseCredentialTypes } from "@/hooks/use-credentials";
import { CredentialType } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import z from "zod";


const formSchema = z.object({
    variableName: z.string().min(1, { message: "Variable name is required" }).regex(/^[A-Za-z_$][A-Za-z0-9_$]*$/, { message: "Variable name must start with a letter, underscore, or dollar sign and contain only alphanumeric characters, underscores, or dollar signs" }),
    credentialId: z.string().min(1, { message: "Credential is required" }),
    systemPrompt: z.string().optional(),
    userPrompt: z.string().min(1, { message: "User prompt is required" })
})

export type AnthropicFormValues = z.infer<typeof formSchema>;

interface AnthropicTriggerDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: z.infer<typeof formSchema>) => void;
    defaultValues?: Partial<AnthropicFormValues>
}

export const AnthropicTriggerDialog = ({ open, onOpenChange, onSubmit, defaultValues = {} }: AnthropicTriggerDialogProps) => {

    const {
            data: items,
            isLoading: credentialsLoading,
        } = useSuspenseCredentialTypes(CredentialType.ANTHROPIC);
    
    
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            variableName: defaultValues.variableName || "",
            credentialId: defaultValues.credentialId || "",
            systemPrompt: defaultValues.systemPrompt || "",
            userPrompt: defaultValues.userPrompt || "",
        },
    })

    useEffect(() => {
        if (open) {
            form.reset({
                variableName: defaultValues.variableName || "",
                credentialId: defaultValues.credentialId || "",
                systemPrompt: defaultValues.systemPrompt || "",
                userPrompt: defaultValues.userPrompt || "",
            })
        }
    }, [open, defaultValues, form])

    const watchVariableName = form.watch("variableName") || "responseData";
    // const watchMethod = form.watch("method");
    // const showBodyField = ["POST", "PUT", "PATCH"].includes(watchMethod);

    const handleSubmit = (values: z.infer<typeof formSchema>) => {
        onSubmit(values);
        onOpenChange(false);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Anthropic Node Configuration</DialogTitle>
                    <DialogDescription>
                        Configure the Anthropic node settings here.Add API Key and prompts as needed
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className="space-y-8 mt-4" 
                    >
                        <FormField
                            control={form.control}
                            name = "credentialId"
                            render = {({ field }) => (
                                <FormItem>
                                    <FormLabel>Gemini Credential</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={
                                        credentialsLoading || !items.ok
                                    }>
                                        <FormControl>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select a credential" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {items.credentials.map((credential) => (
                                                <SelectItem key={credential.id} value={credential.id}>
                                                    <div className="flex items-center gap-2">
                                                        <Image 
                                                            src="/anthropic.svg"
                                                            alt= "Anthropic"
                                                            width={16}
                                                            height={16} 
                                                        />
                                                        {credential.name}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
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
                                        {`{{${watchVariableName}.text}}`}
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name = "systemPrompt"
                            render = {({ field }) => (
                                <FormItem>
                                    <FormLabel>System Prompt (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            className="min-h-120[px] font-mono text-sm"
                                            placeholder="You are a helpful assistant...."
                                            {...field} 
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        The system prompt to guide the behavior of the model. Use {"{{variables}}"} for simple values or {"{{json variable}}"} to stringify objects.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name = "userPrompt"
                            render = {({ field }) => (
                                <FormItem>
                                    <FormLabel>User Prompt</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            className="min-h-120[px] font-mono text-sm"
                                            placeholder="Summarize the following text: {{json httpResponse.data}}"
                                            {...field} 
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        The prompt to send to the AI model. Use {"{{variables}}"} for simple values or {"{{json variable}}"} to stringify objects.
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