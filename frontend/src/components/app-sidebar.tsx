"use client"

import { BookOpenIcon, FolderOpenIcon, HistoryIcon, KeyIcon, LayoutTemplate, LogOutIcon } from "lucide-react"
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "./ui/sidebar"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { credsApi } from "@/lib/api"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Button } from "./ui/button"

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
            },
            {
                title: "Templates",
                icon: LayoutTemplate,
                url: "/templates"
            },
            {
                title: "Docs",
                icon: BookOpenIcon,
                url: "/docs"
            }
        ]
    }
]



export const AppSidebar = () => {
    const queryClient = useQueryClient()
    const router = useRouter();
    const pathName = usePathname();
    const { data: session } = authClient.useSession();
    const user = session?.user;

    const handleSignOut = async () => {
        try {
            await credsApi.signOut();

            await authClient.signOut()

            queryClient.clear()

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
                        <div className="flex items-center justify-between w-full overflow-hidden h-14 p-2">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <Avatar className="h-9 w-9 rounded-md border border-border shrink-0">
                                    <AvatarImage src={user?.image || ""} alt={user?.name || ""} />
                                    <AvatarFallback className="rounded-md bg-secondary text-secondary-foreground font-medium">
                                        {user?.name?.charAt(0).toUpperCase() || "U"}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col flex-1 overflow-hidden" title={user?.email || "Account"}>
                                    <span className="text-sm font-medium leading-none truncate text-foreground/90">{user?.name || "User"}</span>
                                    <span className="text-xs text-muted-foreground leading-tight truncate mt-1">
                                        {user?.email || "email@example.com"}
                                    </span>
                                </div>
                            </div>
                            
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 ml-2 shrink-0 hover:bg-secondary border border-transparent hover:border-border transition-all" 
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleSignOut();
                                }} 
                                title="Sign Out"
                            >
                                <LogOutIcon className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                            </Button>
                        </div>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}