"use client"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"

export function StickyFooter() {
  const [isAtBottom, setIsAtBottom] = useState(false)

  useEffect(() => {
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollTop = window.scrollY
          const windowHeight = window.innerHeight
          const documentHeight = document.documentElement.scrollHeight
          const isNearBottom = scrollTop + windowHeight >= documentHeight - 100

          setIsAtBottom(isNearBottom)
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll() // Check initial state
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <AnimatePresence>
      {isAtBottom && (
        <motion.div
          className="fixed z-50 bottom-0 left-0 w-full h-64 sm:h-80 flex justify-center items-center bg-primary"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <div
            className="relative overflow-hidden w-full h-full flex justify-end px-6 sm:px-12 text-right items-start py-8 sm:py-12 text-primary-foreground"
          >
            <motion.div
              className="flex flex-row space-x-8 sm:space-x-16 md:space-x-24 text-xs sm:text-lg md:text-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <ul className="space-y-1 sm:space-y-2">
                <li className="hover:underline cursor-pointer transition-colors text-primary-foreground hover:text-primary-foreground/80">
                  Workflows
                </li>
                <li className="hover:underline cursor-pointer transition-colors text-primary-foreground hover:text-primary-foreground/80">
                  Executions
                </li>
                <li className="hover:underline cursor-pointer transition-colors text-primary-foreground hover:text-primary-foreground/80">
                  Credentials
                </li>
              </ul>
              <ul className="space-y-1 sm:space-y-2">
                <li className="hover:underline cursor-pointer transition-colors text-primary-foreground hover:text-primary-foreground/80">
                  Docs
                </li>
                <li className="hover:underline cursor-pointer transition-colors text-primary-foreground hover:text-primary-foreground/80">
                  Changelog
                </li>
                <li className="hover:underline cursor-pointer transition-colors text-primary-foreground hover:text-primary-foreground/80">
                  Support
                </li>
              </ul>
            </motion.div>
            <motion.h2
              className="absolute bottom-0 left-0 translate-y-1/4 sm:translate-y-1/3 sm:text-[192px] text-[60px] font-bold select-none text-primary-foreground"
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              Automate
            </motion.h2>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
