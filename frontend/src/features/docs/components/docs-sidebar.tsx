"use client"

import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface SidebarItem {
    title: string;
    href: string;
    subItems?: SidebarItem[];
}

interface SidebarSection {
    title: string;
    items: SidebarItem[];
}

const sidebarItems: SidebarSection[] = [
    {
        title: "Introduction",
        items: [
            { title: "What is Automate", href: "/docs#what-is-automate" },
            { title: "The Goal", href: "/docs#the-goal" },
            { title: "Why Automate", href: "/docs#why-automate" },
        ]
    },
    {
        title: "Nodes Reference",
        items: [
            { title: "Triggers", href: "/docs#triggers" },
            { title: "AI Nodes", href: "/docs#ai-nodes" },
            { title: "Communication", href: "/docs#communication-nodes" },
            { title: "Utility", href: "/docs#utility-nodes" },
        ]
    },
    {
        title: "Guides",
        items: [
            { title: "The Variable System", href: "/docs#variable-system" },
            {
                title: "Example Workflows",
                href: "/docs#linking-nodes",
                subItems: [
                    { title: "Manual -> Gemini -> Slack", href: "/docs/guides/manual-gemini-slack" },
                    { title: "Google Form -> Slack", href: "/docs/guides/google-form-slack" },
                    { title: "Manual -> HTTP -> HTTP", href: "/docs/guides/manual-http-http" },
                ]
            },
        ]
    }
]

export function DocsSidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block">
            <div className="h-full py-6 pr-6 lg:py-8 overflow-y-auto">
                <div className="space-y-4">
                    {sidebarItems.map((section, i) => (
                        <div key={i} className="px-3">
                            <h2 className="mb-2 px-4 text-sm font-semibold tracking-tight text-primary uppercase opacity-70">
                                {section.title}
                            </h2>
                            <div className="space-y-1">
                                {section.items.map((item, j) => (
                                    <div key={j} className="space-y-1">
                                        <Link
                                            href={item.href}
                                            className={cn(
                                                "group flex w-full items-center rounded-md border border-transparent px-4 py-1.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
                                                pathname === item.href ? "text-primary bg-primary/10" : "text-muted-foreground"
                                            )}
                                        >
                                            {item.title}
                                        </Link>
                                        {item.subItems && (
                                            <div className="ml-4 space-y-1 border-l border-primary/20 pl-4">
                                                {item.subItems.map((subItem, k) => (
                                                    <Link
                                                        key={k}
                                                        href={subItem.href}
                                                        className={cn(
                                                            "group flex w-full items-center rounded-md border border-transparent px-2 py-1 text-xs font-medium hover:bg-accent/50 hover:text-accent-foreground transition-colors",
                                                            pathname === subItem.href ? "text-primary" : "text-muted-foreground"
                                                        )}
                                                    >
                                                        {subItem.title}
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </aside>
    )
}
