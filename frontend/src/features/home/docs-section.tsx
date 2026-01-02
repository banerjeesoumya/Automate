"use client"

import { motion } from "framer-motion"
import { ArrowRight, BookOpen, Cpu, Link2, Zap } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

const docHighlights = [
    {
        title: "Node Reference",
        description: "Deep dive into every trigger and action node available in Automate.",
        icon: Cpu,
        color: "text-blue-500",
        delay: 0.1
    },
    {
        title: "Workflow Guides",
        description: "Step-by-step tutorials for building common automation patterns.",
        icon: Zap,
        color: "text-orange-500",
        delay: 0.2
    },
    {
        title: "Variable System",
        description: "Learn how to use data mapping and templating between nodes.",
        icon: Link2,
        color: "text-purple-500",
        delay: 0.3
    }
]

export function DocsSection() {
    return (
        <section id="docs" className="relative py-24 overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-primary/5 rounded-[100%] blur-[120px] -z-10" />

            <div className="container px-4 md:px-8 mx-auto relative z-10">
                <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <Badge variant="outline" className="mb-4 text-primary border-primary/20 bg-primary/5 backdrop-blur-sm">
                            Developer Documentation
                        </Badge>
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                            Everything you need to <span className="text-primary italic">automate</span>
                        </h2>
                        <p className="text-xl text-muted-foreground">
                            Explore our comprehensive guides and references to build powerful, edge-powered workflows in minutes.
                        </p>
                    </motion.div>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-12">
                    {docHighlights.map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: item.delay }}
                            className="bg-card/50 backdrop-blur-sm border border-border/50 p-8 rounded-3xl hover:border-primary/50 transition-all duration-300 group shadow-lg"
                        >
                            <div className={`p-4 rounded-2xl bg-background border border-border/50 w-fit mb-6 shadow-inner group-hover:scale-110 transition-transform duration-300`}>
                                <item.icon className={`h-8 w-8 ${item.color}`} />
                            </div>
                            <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                {item.description}
                            </p>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                    className="flex justify-center"
                >
                    <Link
                        href="/docs"
                        className="group relative flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-bold rounded-2xl hover:scale-105 transition-all duration-300 shadow-xl shadow-primary/20 overflow-hidden"
                    >
                        <BookOpen className="h-5 w-5" />
                        Explore the Docs
                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12" />
                    </Link>
                </motion.div>
            </div>
        </section>
    )
}
