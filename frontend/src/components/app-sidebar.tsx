"use client"

import { FolderOpenIcon, HistoryIcon, KeyIcon, LogOutIcon } from "lucide-react"
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "./ui/sidebar"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { credsApi } from "@/lib/api"

const menuItems = [
    {
        title: "Workflows",
        items: [
            {
                title: "All Workflows",
                icon: FolderOpenIcon,
                url: "/workflows"
            },
            {
                title: "Credentials",
                icon: KeyIcon,
                url: "/credentials"
            },
            {
                title: "Executions",
                icon: HistoryIcon,
                url: "/executions"
            }
        ]
    }
]



export const AppSidebar = () => {
    const queryClient = useQueryClient()
    const router = useRouter();
    const pathName = usePathname();

    const handleSignOut = async () => {
    try {
        // 1️⃣ Attempt manual creds logout (if any)
        await credsApi.signOut();

        // 2️⃣ Also trigger BetterAuth logout for OAuth users
        await authClient.signOut()

        // 3️⃣ Clear any cached session data
        queryClient.clear()

        // 4️⃣ Redirect
        router.push("/signin")
        } catch (error: any) {
        console.error("Sign out failed:", error)
        toast.error("Failed to sign out. Please try again.")
        }
    }
    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild className="gap-x-4 h-10 px-4">
                        <Link href="/" prefetch>
                            <Image src="/logo.svg" alt="Logo" width={30} height={30} />
                            <span className="font-semibold text-sm">Automate</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarHeader>
            <SidebarContent>
                {menuItems.map((group) => (
                    <SidebarGroup key={group.title}>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {group.items.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton 
                                            tooltip={item.title}
                                            isActive={
                                                item.url === "/" ? pathName === "/" : pathName.startsWith(item.url)
                                            }    
                                            asChild
                                            className="gap-x-4 h-10 px-4"
                                        >
                                            <Link href={item.url} prefetch>
                                                <item.icon className="size-4" />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            tooltip = "Sign Out"
                            className="gap-x-4 h-10 px-4"
                            onClick={handleSignOut}
                        >
                            <LogOutIcon className="size-4" />
                            <span>Sign Out</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}