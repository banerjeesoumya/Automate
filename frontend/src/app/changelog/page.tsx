"use client"

import React from "react"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Rocket, Zap, Bug, Star, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface ChangelogEntry {
  version: string
  date: string
  type: 'major' | 'minor' | 'patch'
  title: string
  description: string
  changes: {
    type: 'feat' | 'fix' | 'imp' | 'ref'
    text: string
  }[]
}

const changelogData: ChangelogEntry[] = [
  {
    version: "v1.1.0",
    date: "March 17, 2026",
    type: "minor",
    title: "AI Templates & Guidelines",
    description: "Launched a comprehensive template system with integrated AI workflows and dynamic usage guidelines to help you get started faster than ever.",
    changes: [
      { type: 'feat', text: "New Ready-to-use Workflow Templates section on the homepage." },
      { type: 'feat', text: "Dynamic Template Guide pages at /templates/[id]/guide with variable extraction." },
      { type: 'feat', text: "New Template Usage Guidelines page for general documentation." },
      { type: 'imp', text: "Enhanced template mockups with theme-aware canvas design." },
      { type: 'imp', text: "Improved mobile experience by hiding complex desktop-only features." },
      { type: 'fix', text: "Resolved hydration errors in the sidebar navigation." }
    ]
  },
  {
    version: "v1.0.5",
    date: "March 15, 2026",
    type: "patch",
    title: "Node Integration Polish",
    description: "Focused on refining the node configuration experience and ensuring seamless backend communication.",
    changes: [
      { type: 'feat', text: "Added 'Post as Template' functionality for custom workflows." },
      { type: 'imp', text: "Simplified Gemini/Anthropic/OpenAI node dialogs by making credentials optional during setup." },
      { type: 'imp', text: "Better variable binding validation in the editor." }
    ]
  },
  {
    version: "v1.0.0",
    date: "March 1, 2026",
    type: "major",
    title: "Initial Public Release",
    description: "The first official launch of Automate - an AI-powered automation platform for modern teams.",
    changes: [
      { type: 'feat', text: "Core Workflow Editor with drag-and-drop interface." },
      { type: 'feat', text: "Integration with Gemini, Anthropic, and OpenAI." },
      { type: 'feat', text: "Webhook and Google Form triggers." },
      { type: 'feat', text: "Slack and Discord notification nodes." },
      { type: 'imp', text: "Performance-optimized execution engine." }
    ]
  }
]

const TypeBadge = ({ type }: { type: ChangelogEntry['type'] }) => {
  switch (type) {
    case 'major':
      return <Badge className="bg-primary hover:bg-primary/90 uppercase text-[10px] tracking-wider">Major Release</Badge>
    case 'minor':
      return <Badge variant="secondary" className="uppercase text-[10px] tracking-wider">Minor Update</Badge>
    case 'patch':
      return <Badge variant="outline" className="uppercase text-[10px] tracking-wider border-primary/30 text-primary">Patch</Badge>
  }
}

const ChangeIcon = ({ type }: { type: ChangelogEntry['changes'][0]['type'] }) => {
  switch (type) {
    case 'feat': return <Star className="size-3.5 text-amber-500 shrink-0" />
    case 'fix': return <Bug className="size-3.5 text-rose-500 shrink-0" />
    case 'imp': return <Zap className="size-3.5 text-blue-500 shrink-0" />
    case 'ref': return <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
  }
}

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-50 via-white to-zinc-50 dark:from-zinc-950 dark:via-black dark:to-zinc-950" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      <div className="absolute top-20 left-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12 md:py-24">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6 mb-20"
        >
          <Link 
            href="/"
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors group"
          >
            <ArrowLeft className="mr-2 size-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
          <div className="space-y-2">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
              Changelog
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              Follow our journey as we evolve and build the future of AI automation.
            </p>
          </div>
        </motion.div>

        {/* Timeline */}
        <div className="relative border-l border-primary/20 ml-4 md:ml-0 md:pl-0">
          {changelogData.map((entry, index) => (
            <motion.div 
              key={entry.version}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative pl-10 pb-16 last:pb-0"
            >
              {/* Timeline Marker */}
              <div className="absolute left-[-5px] top-6 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-background shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
              
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                {/* Date and Version */}
                <div className="md:w-48 shrink-0 pt-1">
                  <span className="text-sm font-medium text-muted-foreground block mb-2">{entry.date}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold font-mono tracking-tight">{entry.version}</span>
                    <TypeBadge type={entry.type} />
                  </div>
                </div>

                {/* Content Card */}
                <div className="flex-1 space-y-6">
                  <div className="space-y-3">
                    <h2 className="text-3xl font-bold leading-tight">{entry.title}</h2>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      {entry.description}
                    </p>
                  </div>

                  <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 md:p-8 space-y-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-primary/80">What's new</h3>
                    <ul className="grid gap-3">
                      {entry.changes.map((change, i) => (
                        <li key={i} className="flex items-start gap-4 text-[15px] group">
                          <div className="mt-1 shrink-0">
                            <ChangeIcon type={change.type} />
                          </div>
                          <span className="text-muted-foreground group-hover:text-foreground transition-colors leading-relaxed">
                            {change.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              
              {index !== changelogData.length - 1 && (
                <Separator className="mt-16 bg-primary/10" />
              )}
            </motion.div>
          ))}
        </div>

        {/* Footer info */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-20 pt-12 border-t border-border/50 text-center"
        >
          <div className="inline-flex items-center justify-center p-4 rounded-full bg-primary/5 mb-6 text-primary">
            <Rocket className="size-6 mr-3" />
            <span className="font-semibold">More coming soon</span>
          </div>
          <p className="text-muted-foreground">
            Stay tuned for exciting new features and improvements.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
