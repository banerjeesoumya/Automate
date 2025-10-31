"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import Image from "next/image"
import { redirect, useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import z from "zod"
import { authClient } from "@/lib/auth-client"
import { toast } from "sonner"
import { useAuthRedirect } from "@/hooks/useAuthRedirect"
import { credsApi } from "@/lib/api"

const loginSchema = z.object({
    email: z.email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
})

type LoginFormValues = z.infer<typeof loginSchema>

export const LoginForm = () => {
    // const session = await authClient.getSession();
    // console.log(session)
    // if (session.data != null) {
    //     redirect("/")
    // }
    useAuthRedirect({ requireNoAuth: true });
    const router = useRouter()
    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })
    const onSubmit = async (values: LoginFormValues) => {
        try {
            await credsApi.signInWithEmail(values.email, values.password);
            const session = await authClient.getSession();
            console.log("Logged in user session:", session);
            router.push("/");
        } catch (error) {
            // @ts-ignore
            toast.error(error.response?.data?.message || "Login failed");
            return;
        }
        // await authClient.signIn.email({
        //     email: values.email,
        //     password: values.password,
        //     // callbackURL: "/"
        // }, {
        //     onSuccess: async () => {
        //         // router.push("/")
        //         console.log("Login successful")
        //         // const response = await authClient.getSession()
        //         // console.log(response)
        //         router.push("/")
        //     },
        //     onError: (ctx) => {
        //         toast.error(ctx.error.message)
        //     }
        // });
    } 
    const isPending = form.formState.isSubmitting
    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader className="text-center">
                    <CardTitle>
                        Welcome back! Please sign in to your account.
                    </CardTitle>
                    <CardDescription>
                        LogIn to continue to your dashboard.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <div className="grid gap-6">
                                <div className="flex flex-col gap-4">
                                    <Button 
                                        variant="outline"
                                        className="w-full"
                                        type="button"
                                        disabled={isPending}
                                        onClick={async () => {
                                            const response = await authClient.signIn.social({
                                                provider: "google",
                                            }, {
                                                onSuccess: async () => {
                                                    router.push("/");
                                                },
                                                onError: (ctx) => {
                                                    toast.error(ctx.error.message || "Login failed. Please try again.");
                                                }
                                            })
                                        }}
                                    >
                                        <Image alt="Google" src="/google.svg" width={20} height={20} />
                                        Sign in with Google
                                    </Button>
                                    <Button 
                                        variant="outline"
                                        className="w-full"
                                        type="button"
                                        disabled={isPending}
                                        onClick={async () => {
                                            const response = await authClient.signIn.social({
                                                provider: "github",
                                            }, {
                                                onSuccess: async () => {
                                                    router.push("/");
                                                },
                                                onError: (ctx) => {
                                                    toast.error(ctx.error.message || "Login failed. Please try again.");
                                                }
                                            })
                                        }}
                                    >
                                        <Image alt="Github" src="/github.svg" width={20} height={20} />
                                        Sign in with Github
                                    </Button>
                                </div>
                                <div className="grid gap-6">
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="email"
                                                        placeholder="email@example.com"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Password</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="password"
                                                        placeholder="••••••••"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button 
                                        type="submit"
                                        disabled={isPending}
                                        className="w-full"
                                    >
                                        {isPending ? "Logging in..." : "Log In"}
                                    </Button>
                                </div>
                                <div className="text-center text-sm">
                                    Don't have an account?{" "}
                                    <Link href="/signup" className="underline underline-offset-4">
                                        Sign Up
                                    </Link>
                                </div>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}