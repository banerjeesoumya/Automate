"use client"

import type React from "react"

import { useTheme } from "next-themes"
import dynamic from "next/dynamic"
const Earth = dynamic(() => import("@/components/ui/globe"), { ssr: false })
import ScrambleHover from "@/components/ui/scramble"
import { FollowerPointerCard } from "@/components/ui/following-pointer"
import { motion, useInView } from "framer-motion"
import { Suspense, useEffect, useRef, useState } from "react"
import { geist } from "@/lib/fonts"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { Zap, Globe, Plus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Features() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })
  const { theme } = useTheme()
  const [isHovering, setIsHovering] = useState(false)
  const [isCliHovering, setIsCliHovering] = useState(false)
  const [isFeature3Hovering, setIsFeature3Hovering] = useState(false)
  const [isFeature4Hovering, setIsFeature4Hovering] = useState(false)
  const [inputValue, setInputValue] = useState("")

  const [baseColor, setBaseColor] = useState<[number, number, number]>([0.906, 0.541, 0.325]) // #e78a53 in RGB normalized
  const [glowColor, setGlowColor] = useState<[number, number, number]>([0.906, 0.541, 0.325]) // #e78a53 in RGB normalized

  const [dark, setDark] = useState<number>(theme === "dark" ? 1 : 0)

  useEffect(() => {
    setBaseColor([0.906, 0.541, 0.325]) // #e78a53
    setGlowColor([0.906, 0.541, 0.325]) // #e78a53
    setDark(theme === "dark" ? 1 : 0)
  }, [theme])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      setInputValue("")
    }
  }

  return (
    <section id="features" className="text-foreground relative overflow-hidden py-12 sm:py-24 md:py-32">
      <div className="bg-primary absolute -top-10 left-1/2 h-16 w-44 -translate-x-1/2 rounded-full opacity-40 blur-3xl select-none"></div>
      <div className="via-primary/50 absolute top-0 left-1/2 h-px w-3/5 -translate-x-1/2 bg-gradient-to-r from-transparent to-transparent transition-all ease-in-out"></div>
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 50 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ duration: 0.5, delay: 0 }}
        className="container mx-auto flex flex-col items-center gap-6 sm:gap-12"
      >
        <h2
          className={cn(
            "via-foreground mb-8 bg-gradient-to-b from-zinc-800 to-zinc-700 bg-clip-text text-center text-4xl font-semibold tracking-tighter text-transparent md:text-[54px] md:leading-[60px]",
            geist.className,
          )}
        >
          Features
        </h2>
        <FollowerPointerCard
          title={
            <div className="flex items-center gap-2">
              <span>✨</span>
              <span>Interactive Features</span>
            </div>
          }
        >
          <div className="cursor-none">
            <div className="grid grid-cols-12 gap-4 justify-center">
              <motion.div
                className="group border-secondary/40 text-card-foreground relative col-span-12 flex flex-col overflow-hidden rounded-xl border-2 p-6 shadow-xl transition-all ease-in-out md:col-span-6 xl:col-span-6"
                onMouseEnter={() => setIsCliHovering(true)}
                onMouseLeave={() => setIsCliHovering(false)}
                ref={ref}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                whileHover={{
                  scale: 1.02,
                  borderColor: "rgba(231, 138, 83, 0.6)",
                  boxShadow: "0 0 30px rgba(231, 138, 83, 0.2)",
                }}
                style={{ transition: "all 0s ease-in-out" }}
              >
                <div className="flex flex-col gap-4">
                  <h3 className="text-2xl leading-none font-semibold tracking-tight">Visual workflow builder</h3>
                  <div className="text-md text-muted-foreground flex flex-col gap-2 text-sm">
                    <p className="max-w-[460px]">
                      Drag, connect, and configure nodes to turn manual processes into repeatable workflows that your whole
                      team can understand.
                    </p>
                  </div>
                </div>
                <div className="pointer-events-none flex grow items-center justify-center select-none relative">
                  <div
                    className="relative w-full h-[400px] rounded-xl overflow-hidden"
                    style={{ borderRadius: "20px" }}
                  >
                    <div className="absolute inset-0">
                      <img
                        src="/workflow_card_bg_lighter.png"
                        alt="Workflow Builder Background"
                        className="w-full h-full object-cover rounded-xl"
                      />
                    </div>

                    <motion.div
                      className="absolute inset-0"
                      initial={{ opacity: 0 }}
                      animate={isCliHovering ? { opacity: 1 } : { opacity: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute">
                        {/* Left Connections */}
                        <motion.path d="M 20 28 L 44 50" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" strokeDasharray="4 4" animate={isCliHovering ? { strokeDashoffset: -8 } : { strokeDashoffset: 0 }} transition={{ duration: 1, ease: "linear", repeat: Number.POSITIVE_INFINITY }} />
                        <motion.path d="M 20 50 L 44 50" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" strokeDasharray="4 4" animate={isCliHovering ? { strokeDashoffset: -8 } : { strokeDashoffset: 0 }} transition={{ duration: 1, ease: "linear", repeat: Number.POSITIVE_INFINITY }} />
                        <motion.path d="M 20 72 L 44 50" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" strokeDasharray="4 4" animate={isCliHovering ? { strokeDashoffset: -8 } : { strokeDashoffset: 0 }} transition={{ duration: 1, ease: "linear", repeat: Number.POSITIVE_INFINITY }} />

                        {/* Right Connections */}
                        <motion.path d="M 80 28 L 56 50" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" strokeDasharray="4 4" animate={isCliHovering ? { strokeDashoffset: -8 } : { strokeDashoffset: 0 }} transition={{ duration: 1, ease: "linear", repeat: Number.POSITIVE_INFINITY }} />
                        <motion.path d="M 80 50 L 56 50" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" strokeDasharray="4 4" animate={isCliHovering ? { strokeDashoffset: -8 } : { strokeDashoffset: 0 }} transition={{ duration: 1, ease: "linear", repeat: Number.POSITIVE_INFINITY }} />
                        <motion.path d="M 80 72 L 56 50" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" strokeDasharray="4 4" animate={isCliHovering ? { strokeDashoffset: -8 } : { strokeDashoffset: 0 }} transition={{ duration: 1, ease: "linear", repeat: Number.POSITIVE_INFINITY }} />
                      </svg>
                    </motion.div>

                    <motion.div
                      className="absolute top-1/2 left-1/2 w-16 h-16 bg-purple-500 rounded-full blur-[74px] opacity-65 transform -translate-x-1/2 -translate-y-1/2"
                      initial={{ scale: 1 }}
                      animate={isCliHovering ? { scale: [1, 1.342, 1, 1.342] } : { scale: 1 }}
                      transition={{
                        duration: 3,
                        ease: "easeInOut",
                        repeat: isCliHovering ? Number.POSITIVE_INFINITY : 0,
                        repeatType: "loop",
                      }}
                    />

                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex items-center gap-8">
                        <div className="flex flex-col gap-3">
                          {["Google Forms", "Slack", "Discord"].map((item, index) => (
                            <motion.div
                              key={`left-${index}`}
                              className="bg-card rounded px-3 py-2 flex items-center gap-2 text-card-foreground text-sm font-medium shadow-sm"
                              initial={{ opacity: 1, x: 0 }}
                              animate={isCliHovering ? { x: [-20, 0] } : { x: 0 }}
                              transition={{
                                duration: 0.5,
                                delay: index * 0.1,
                              }}
                              whileHover={{ scale: 1.05 }}
                            >
                              <div className="w-4 h-4 flex items-center justify-center">
                                {index === 0 && <span className="text-xs"><Image src="/googleform.svg" alt="Google Forms" width={16} height={16} /></span>}
                                {index === 1 && <span className="text-xs"><Image src="/slack.svg" alt="Slack" width={16} height={16} /></span>}
                                {index === 2 && <span className="text-xs"><Image src="/discord.svg" alt="Discord" width={16} height={16} /></span>}
                              </div>
                              {item}
                            </motion.div>
                          ))}
                        </div>

                        <motion.div
                          className="w-16 h-16 border border-gray-300 rounded-lg overflow-hidden shadow-lg"
                          initial={{ opacity: 1, scale: 1 }}
                          animate={isCliHovering ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                          whileHover={{ scale: 1.1, rotate: 5 }}
                        >
                          <Image
                            src="/logo.svg"
                            alt="Logo"
                            className="w-16 h-16 object-contain"
                            width={64}
                            height={64}
                          />
                        </motion.div>

                        <div className="flex flex-col gap-3">
                          {["HTTP APIs", "AI Providers", "Webhooks"].map((item, index) => (
                            <motion.div
                              key={`right-${index}`}
                              className="bg-card rounded px-3 py-2 flex items-center gap-2 text-card-foreground text-sm font-medium shadow-sm"
                              initial={{ opacity: 1, x: 0 }}
                              animate={isCliHovering ? { x: [20, 0] } : { x: 0 }}
                              transition={{
                                duration: 0.5,
                                delay: index * 0.1,
                              }}
                              whileHover={{ scale: 1.05 }}
                            >
                              <div className="w-4 h-4 flex items-center justify-center">
                                {index === 0 && <span className="text-xs">🔗</span>}
                                {index === 1 && <span className="text-xs">🤖</span>}
                                {index === 2 && <span className="text-xs">🌐</span>}
                              </div>
                              {item}
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <motion.div
                      className="absolute inset-0 flex items-center justify-center"
                      initial={{ opacity: 0 }}
                      animate={isCliHovering ? { opacity: 1 } : { opacity: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <svg width="350" height="350" viewBox="0 0 350 350" className="opacity-40">
                        <motion.path
                          d="M 175 1.159 C 271.01 1.159 348.841 78.99 348.841 175 C 348.841 271.01 271.01 348.841 175 348.841 C 78.99 348.841 1.159 271.01 1.159 175 C 1.159 78.99 78.99 1.159 175 1.159 Z"
                          stroke="currentColor"
                          strokeWidth="1.16"
                          fill="transparent"
                          strokeDasharray="4 4"
                          className="text-foreground/38"
                          initial={{ pathLength: 0, rotate: 0 }}
                          animate={isCliHovering ? { pathLength: 1, rotate: 360 } : { pathLength: 0, rotate: 0 }}
                          transition={{
                            pathLength: { duration: 3, ease: "easeInOut" },
                            rotate: {
                              duration: 20,
                              repeat: isCliHovering ? Number.POSITIVE_INFINITY : 0,
                              ease: "linear",
                            },
                          }}
                        />
                      </svg>
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              {/* Global */}
              <motion.div
                className="group border-secondary/40 text-card-foreground relative col-span-12 flex flex-col overflow-hidden rounded-xl border-2 p-6 shadow-xl transition-all ease-in-out md:col-span-6 xl:col-span-6"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                ref={ref}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                whileHover={{
                  scale: 1.02,
                  borderColor: "rgba(231, 138, 83, 0.6)",
                  boxShadow: "0 0 30px rgba(231, 138, 83, 0.2)",
                }}
                style={{ transition: "all 0s ease-in-out" }}
              >
                <div className="flex flex-col gap-4">
                  <h3 className="text-2xl leading-none font-semibold tracking-tight">Edge-Powered Workflow Runtime</h3>
                  <div className="text-md text-muted-foreground flex flex-col gap-2 text-sm">
                    <p className="max-w-[460px]">
                      Ultra-low latency execution powered by 330+ cities worldwide. Your workflows run within 50ms of 95% of the global population, ensuring near-instant triggers and data synchronization.
                    </p>
                  </div>
                </div>
                <div className="flex min-h-[300px] grow items-start justify-center select-none">
                  <h1 className="mt-8 text-center text-5xl leading-[100%] font-semibold sm:leading-normal lg:mt-12 lg:text-6xl">
                    <span className='bg-background relative mt-3 inline-block w-fit rounded-md px-1.5 py-0.5 before:absolute before:top-0 before:left-0 before:z-10 before:h-full before:w-full before:bg-[url("/noise.gif")] before:opacity-[0.09] before:content-[""]'>
                      <ScrambleHover
                        text="Global Edge"
                        scrambleSpeed={70}
                        maxIterations={20}
                        useOriginalCharsOnly={false}
                        className="cursor-pointer bg-gradient-to-t from-[#e78a53] to-[#e78a53] bg-clip-text text-transparent"
                        isHovering={isHovering}
                        setIsHovering={setIsHovering}
                        characters="abcdefghijklmnopqrstuvwxyz!@#$%^&*()_+-=[]{}|;':\,./<>?"
                      />
                    </span>
                  </h1>
                  <div className="absolute top-64 z-10 flex items-center justify-center">
                    <div className="w-[400px] h-[400px]">
                      <Suspense
                        fallback={
                          <div className="bg-secondary/20 h-[400px] w-[400px] animate-pulse rounded-full"></div>
                        }
                      >
                        {/* @ts-ignore */}
                        <Earth baseColor={baseColor} markerColor={[0, 0, 0]} glowColor={glowColor} dark={dark} />
                      </Suspense>
                    </div>
                  </div>
                  <div className="absolute top-1/2 w-full translate-y-20 scale-x-[1.2] opacity-70 transition-all duration-1000 group-hover:translate-y-8 group-hover:opacity-100">
                    <div className="from-primary/50 to-primary/0 absolute left-1/2 h-[256px] w-[60%] -translate-x-1/2 scale-[2.5] rounded-[50%] bg-radial from-10% to-60% opacity-20 sm:h-[512px] dark:opacity-100"></div>
                    <div className="from-primary/30 to-primary/0 absolute left-1/2 h-[128px] w-[40%] -translate-x-1/2 scale-200 rounded-[50%] bg-radial from-10% to-60% opacity-20 sm:h-[256px] dark:opacity-100"></div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="group border-secondary/40 text-card-foreground relative col-span-12 hidden md:flex flex-col overflow-hidden rounded-xl border-2 p-6 shadow-xl transition-all ease-in-out mt-8"
                onMouseEnter={() => setIsFeature3Hovering(true)}
                onMouseLeave={() => setIsFeature3Hovering(false)}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                whileHover={{
                  scale: 1.01,
                  borderColor: "rgba(231, 138, 83, 0.6)",
                  boxShadow: "0 0 30px rgba(231, 138, 83, 0.2)",
                }}
                style={{ transition: "all 0s ease-in-out" }}
              >
                <div className="flex flex-col gap-4">
                  <h3 className="text-2xl leading-none font-semibold tracking-tight">Ready-to-use Workflow Templates</h3>
                  <div className="text-md text-muted-foreground flex flex-col gap-2 text-sm">
                    <p className="max-w-none">
                      Get started instantly with our library of pre-built templates. Whether you're summarizing articles, analyzing feedback, or routing complex logic, our templates provide a solid foundation for your automation journey.
                    </p>
                  </div>
                </div>
                <div className="flex justify-center mt-6 mb-2 z-10">
                  <Link href="/template-guidelines">
                    <Button variant="outline" className="border-secondary hover:bg-secondary/20 transition-all hover:scale-105">
                      Template Guidelines
                    </Button>
                  </Link>
                </div>
                <div className="flex grow items-center justify-center select-none relative">
                  <TemplateMockupStack />
                </div>
              </motion.div>

              <div className="col-span-12 flex md:hidden flex-col items-center justify-center p-8 text-center border-2 border-dashed border-secondary/40 rounded-xl mt-8">
                <div className="w-12 h-12 rounded-full bg-secondary/30 flex items-center justify-center mb-4">
                  <span className="text-2xl">💻</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Desktop Experience Recommended</h3>
                <p className="text-muted-foreground text-sm">
                  To view our interactive architecture and workflow templates, please open this website on a laptop or desktop.
                </p>
              </div>

              {/* Dynamic routing */}
              {/* <motion.div
                className="group border-secondary/40 text-card-foreground relative col-span-12 flex flex-col overflow-hidden rounded-xl border-2 p-6 shadow-xl transition-all ease-in-out md:col-span-6 xl:col-span-6 xl:col-start-8"
                onMouseEnter={() => setIsFeature4Hovering(true)}
                onMouseLeave={() => setIsFeature4Hovering(false)}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                transition={{ duration: 0.5, delay: 1.0 }}
                whileHover={{
                  rotateY: 5,
                  rotateX: 2,
                  boxShadow: "0 20px 40px rgba(231, 138, 83, 0.3)",
                  borderColor: "rgba(231, 138, 83, 0.6)",
                }}
                style={{ transition: "all 0s ease-in-out" }}
              >
                <div className="flex flex-col gap-4">
                  <h3 className="text-2xl leading-none font-semibold tracking-tight">Branching & routing</h3>
                  <div className="text-md text-muted-foreground flex flex-col gap-2 text-sm">
                    <p className="max-w-[460px]">
                      Model complex business logic with conditional branches and multi‑step paths so each workflow follows
                      exactly the right journey.
                    </p>
                  </div>
                </div>
                <div className="flex grow items-center justify-center select-none relative min-h-[300px] p-4">
                  <div className="relative w-full max-w-sm">
                    <img
                      src="/modern-grid-layout.png"
                      alt="Dynamic Layout Example"
                      className="w-full h-auto rounded-lg shadow-lg"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg"></div>
                  </div>
                </div>
              </motion.div> */}
            </div>
          </div>
        </FollowerPointerCard>
      </motion.div>
    </section>
  )
}

const TemplateMockupStack = () => {
  const [frontIndex, setFrontIndex] = useState(0)

  const workflows = [
    {
      id: 0,
      title: "AI Article Summarizer",
      description: "Fetch content from an API or URL and generate a concise AI summary using Gemini. Useful for quickly summarizing blog posts, news articles, or API responses.",
      icon: "📑",
      category: "Content & AI",
      nodes: [
        { id: "1", type: "trigger", icon: <Zap className="w-8 h-8 text-neutral-400" />, label: "Manual Trigger", subLabel: "Run workflow manually", x: 100, y: 160 },
        { id: "2", type: "action", icon: <Globe className="w-8 h-8 text-neutral-400" />, label: "HTTP Request", subLabel: "Fetch from URL", x: 360, y: 160 },
        { id: "3", type: "action", icon: <Image src="/gemini.svg" alt="Gemini" width={32} height={32} />, label: "Gemini", subLabel: "gemini-2.5-flash-lite Summari...", x: 620, y: 160 }
      ],
      connections: [
        { from: "1", to: "2" },
        { from: "2", to: "3" }
      ]
    },
    {
      id: 1,
      title: "Customer Feedback Analyzer",
      description: "Analyze incoming Google Form responses using Anthropic AI and automatically send summarized feedback insights to Slack.",
      icon: "💬",
      category: "Customer Support Base",
      nodes: [
        { id: "1", type: "trigger", icon: <Image src="/googleform.svg" alt="Google Form" width={32} height={32} />, label: "Google Form", subLabel: "When form is submitted", x: 100, y: 160 },
        { id: "2", type: "action", icon: <Image src="/anthropic.svg" alt="Anthropic" width={32} height={32} />, label: "Anthropic", subLabel: "Analyze feedback", x: 360, y: 160 },
        { id: "3", type: "action", icon: <Image src="/slack.svg" alt="Slack" width={32} height={32} />, label: "Slack", subLabel: "Send Summary: {{aiSummary...", x: 620, y: 160 }
      ],
      connections: [
        { from: "1", to: "2" },
        { from: "2", to: "3" }
      ]
    }
  ]

  return (
    <div className="w-full flex-col flex items-center justify-center min-h-[500px] mb-8 relative">
      <div className="relative w-full max-w-[900px] h-[500px] mx-auto mt-8">
        {workflows.map((workflow, index) => {
          // Calculate offset relative to the front card
          // The front card is at offset 0
          // The card behind it is at offset 1, etc.
          const totalCards = workflows.length;
          let offset = (index - frontIndex + totalCards) % totalCards;
          
          const isFront = offset === 0;
          
          // Visual properties based on offset
          const translateY = -offset * 40; 
          const scale = 1 - (offset * 0.05);
          const zIndex = 30 - offset;
          const opacity = isFront ? 1 : 1 - (offset * 0.2);
          const brightness = isFront ? 1 : 0.6; // Darken cards behind

          return (
            <motion.div
              key={workflow.id}
              className={cn(
                "absolute bottom-0 left-0 right-0 w-full h-[450px] rounded-xl border border-secondary shadow-2xl overflow-hidden cursor-pointer",
                "bg-background dark:bg-[#111111]" // Match theme
              )}
              initial={false}
              animate={{
                y: translateY,
                scale: scale,
                opacity: opacity,
                filter: `brightness(${brightness})`
              }}
              transition={{
                duration: 0.5,
                ease: "easeInOut"
              }}
              style={{
                zIndex: zIndex,
                transformOrigin: "bottom center"
              }}
              onClick={() => setFrontIndex(index)}
              // Add a slight hover effect to cards that are behind to show they are clickable
              whileHover={!isFront ? { y: translateY - 10 } : {}}
            >
              {/* Header section */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-muted/30 dark:bg-[#161616]">
                <div className="flex items-center gap-3">
                  <span className="text-xl bg-secondary/50 p-1.5 rounded-md">{workflow.icon}</span>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm text-foreground">{workflow.title}</h4>
                    <span className="text-muted-foreground text-xs">&mdash;</span>
                    <p className="text-xs text-muted-foreground truncate max-w-[300px] md:max-w-[400px]">
                      {workflow.description}
                    </p>
                  </div>
                </div>
                {/* Actions that look like window controls or toolbar actions */}
                <div className="flex items-center gap-4 text-muted-foreground">
                    <svg className="w-4 h-4 hover:text-foreground transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    <svg className="w-4 h-4 hover:text-foreground transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    <svg className="w-4 h-4 hover:text-foreground transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
                </div>
              </div>

              {/* Canvas area */}
              <div className="w-full h-[calc(100%-60px)] relative overflow-hidden bg-[radial-gradient(#80808040_1px,transparent_1px)] bg-[size:24px_24px] bg-background dark:bg-[#111111]">
                 
                 {/* Live Preview Mode Badge */}
                 <div className="absolute top-4 left-4 z-10">
                     <div className="bg-background/80 backdrop-blur-sm border border-border px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-medium text-muted-foreground shadow-sm">
                         <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                         Live Preview Mode
                     </div>
                 </div>

                 {/* Add Node Button */}
                 <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30">
                     <div className="bg-[#FFEDD5] text-[#F97316] px-5 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm font-semibold transform hover:scale-105 transition-transform duration-200 cursor-default">
                         <Plus className="w-4 h-4" />
                         Add Node
                     </div>
                 </div>

                 {/* Connections (dashed lines) */}
                 <svg className="absolute inset-0 w-full h-full pointer-events-none">
                   {workflow.connections.map((conn, i) => {
                     const fromNode = workflow.nodes.find(n => n.id === conn.from);
                     const toNode = workflow.nodes.find(n => n.id === conn.to);
                     
                     if (!fromNode || !toNode) return null;

                     // Path starts from right side of 'from' node, ends at left side of 'to' node
                     const startX = fromNode.x + 64 + 4; // 64 is width + 4 offset
                     const startY = fromNode.y + 32; // vertically centered in 64 h box
                     const endX = toNode.x - 4;      // left edge - 4 offset
                     const endY = toNode.y + 32;

                     return (
                      <g key={i}>
                        <path
                          d={`M ${startX} ${startY} C ${startX + 50} ${startY}, ${endX - 50} ${endY}, ${endX} ${endY}`}
                          stroke="#666"
                          strokeWidth="2"
                          fill="none"
                          strokeDasharray="4 4"
                          className={isFront ? "animate-[stroke-dashoffset_1s_linear_infinite]" : ""}
                          style={{ strokeDashoffset: isFront ? 0 : 8 }}
                        />
                      </g>
                     )
                   })}
                 </svg>

                 {/* Nodes */}
                 {workflow.nodes.map((node, i) => (
                   <div
                     key={i}
                     className="absolute flex flex-col items-center"
                     style={{
                       left: `${node.x}px`,
                       top: `${node.y}px`,
                     }}
                   >
                     {/* Node icon box */}
                     <div className="w-16 h-16 rounded-2xl bg-[#1A1A1A] border border-white/10 flex items-center justify-center shadow-lg hover:border-white/30 transition-colors z-10 relative">
                        {/* Connection points on left/right for visualization */}
                        {node.type !== 'trigger' && <div className="absolute -left-1.5 w-2 h-2 rounded-full border border-[#111] bg-[#e78a53]" />}
                        <div className="absolute -right-1.5 w-2 h-2 rounded-full border border-[#111] bg-[#e78a53]" />
                        
                        {node.icon}
                     </div>
                     {/* Labels below node */}
                     <div className="mt-3 text-center min-w-[120px]">
                        <p className="text-sm font-semibold text-foreground/90 whitespace-nowrap overflow-hidden text-ellipsis">{node.label}</p>
                        <p className="text-[11px] text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis mt-1">{node.subLabel}</p>
                     </div>
                   </div>
                 ))}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

