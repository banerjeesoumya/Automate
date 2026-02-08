"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import Hero from "@/features/home/hero"
import Features from "@/features/home/features"
import { DocsSection } from "@/features/home/docs-section"
import { NewReleasePromo } from "@/features/home/new-release-promo"
import { FAQSection } from "@/features/home/faq-section"
import { PricingSection } from "@/features/home/pricing-section"
import { InteractiveArchitecture } from "@/components/interactive-architecture"
import { StickyFooter } from "@/features/home/sticky-footer"
import Image from "next/image"
import { useTheme } from "next-themes"
import { Moon, Sun, Zap } from "lucide-react"
import { useAuthRedirect } from "@/hooks/useAuthRedirect"

export default function Home() {
  const { user, isPending } = useAuthRedirect()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  if (!mounted) return null

  const ThemeToggle = () => (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="fixed top-24 right-6 z-[9999] p-3 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 shadow-lg hover:bg-accent transition-all duration-300 group"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="size-5 text-orange-400 group-hover:rotate-45 transition-transform duration-500" />
      ) : (
        <Moon className="size-5 text-blue-600 group-hover:-rotate-12 transition-transform duration-500" />
      )}
    </button>
  )

  const handleMobileNavClick = (elementId: string) => {
    setIsMobileMenuOpen(false)
    setTimeout(() => {
      const element = document.getElementById(elementId)
      if (element) {
        const headerOffset = 120 // Account for sticky header height + margin
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
        const offsetPosition = elementPosition - headerOffset

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        })
      }
    }, 100)
  }

  return (
    <div className="min-h-screen w-full relative bg-background">
      <ThemeToggle />
      {/* Pearl Mist Background with Top Glow */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: "radial-gradient(ellipse 50% 35% at 50% 0%, rgba(226, 232, 240, 0.12), transparent 60%), var(--background)",
        }}
      />

      {/* Desktop Header */}
      <header
        className={`sticky top-4 z-[9999] mx-auto hidden w-full flex-row items-center justify-between self-start rounded-full bg-background/80 md:flex backdrop-blur-sm border border-border/50 shadow-lg transition-all duration-300 ${isScrolled ? "max-w-3xl px-2" : "max-w-5xl px-4"
          } py-2`}
        style={{
          willChange: "transform",
          transform: "translateZ(0)",
          backfaceVisibility: "hidden",
          perspective: "1000px",
        }}
      >
        <Link
          className={`z-50 flex items-center justify-center gap-2 transition-all duration-300 ${isScrolled ? "ml-4" : ""
            }`}
          href="/"
        >
          <Image
            src="/logo.svg"
            alt="Logo"
            width={40}
            height={40}
            className="text-foreground shrink-0"
          />
          <span className="font-bold text-xl tracking-tighter shrink-0 bg-gradient-to-r from-[#FFBC7D] to-[#FF9736] bg-clip-text text-transparent">
            Automate
          </span>
        </Link>

        <div className="hidden flex-1 flex-row items-center justify-center space-x-1 text-sm font-medium text-muted-foreground transition duration-200 md:flex">
          <a
            className="px-3 py-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            onClick={(e) => {
              e.preventDefault()
              const element = document.getElementById("features")
              if (element) {
                const headerOffset = 120
                const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
                const offsetPosition = elementPosition - headerOffset
                window.scrollTo({ top: offsetPosition, behavior: "smooth" })
              }
            }}
          >
            Features
          </a>
          <a
            className="px-3 py-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            onClick={(e) => {
              e.preventDefault()
              const element = document.getElementById("architecture")
              if (element) {
                const headerOffset = 120
                const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
                const offsetPosition = elementPosition - headerOffset
                window.scrollTo({ top: offsetPosition, behavior: "smooth" })
              }
            }}
          >
            Architecture
          </a>
          <a
            className="px-3 py-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            onClick={(e) => {
              e.preventDefault()
              const element = document.getElementById("docs")
              if (element) {
                const headerOffset = 120
                const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
                const offsetPosition = elementPosition - headerOffset
                window.scrollTo({ top: offsetPosition, behavior: "smooth" })
              }
            }}
          >
            Docs
          </a>
          {/* <a
            className="px-3 py-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            onClick={(e) => {
              e.preventDefault()
              const element = document.getElementById("pricing")
              if (element) {
                const headerOffset = 120
                const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
                const offsetPosition = elementPosition - headerOffset
                window.scrollTo({ top: offsetPosition, behavior: "smooth" })
              }
            }}
          >
            Pricing
          </a> */}
          <a
            className="px-3 py-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            onClick={(e) => {
              e.preventDefault()
              const element = document.getElementById("faq")
              if (element) {
                const headerOffset = 120
                const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
                const offsetPosition = elementPosition - headerOffset
                window.scrollTo({ top: offsetPosition, behavior: "smooth" })
              }
            }}
          >
            FAQ
          </a>
        </div>

        <div className="flex items-center gap-4">
          {!isPending && (
            user ? (
              <Link
                href="/workflows"
                className="rounded-md font-bold relative cursor-pointer hover:-translate-y-0.5 transition duration-200 flex items-center justify-center gap-2 bg-gradient-to-b from-primary to-primary/80 text-primary-foreground shadow-[0px_2px_0px_0px_rgba(255,255,255,0.3)_inset] px-4 py-2 text-sm"
              >
                <Zap className="size-4 fill-current mr-1" />
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/signin"
                  className="font-medium transition-colors hover:text-foreground text-muted-foreground text-sm cursor-pointer"
                >
                  Log In
                </Link>

                <Link
                  href="/signup"
                  className="rounded-md font-bold relative cursor-pointer hover:-translate-y-0.5 transition duration-200 inline-block text-center bg-gradient-to-b from-primary to-primary/80 text-primary-foreground shadow-[0px_2px_0px_0px_rgba(255,255,255,0.3)_inset] px-4 py-2 text-sm"
                >
                  Sign Up
                </Link>
              </>
            )
          )}
        </div>
      </header>

      {/* Mobile Header */}
      <header className="sticky top-4 z-[9999] mx-4 flex w-auto flex-row items-center justify-between rounded-full bg-background/80 backdrop-blur-sm border border-border/50 shadow-lg md:hidden px-4 py-3">
        <Link
          className="flex items-center justify-center gap-2"
          href="/"
        >
          <Image
            src="/logo.svg"
            alt="Logo"
            width={32}
            height={32}
            className="text-foreground shrink-0"
          />
          <span className="font-bold text-lg tracking-tighter shrink-0 bg-gradient-to-r from-[#FFBC7D] to-[#FF9736] bg-clip-text text-transparent">
            Automate
          </span>
        </Link>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-background/50 border border-border/50 transition-colors hover:bg-background/80"
          aria-label="Toggle menu"
        >
          <div className="flex flex-col items-center justify-center w-5 h-5 space-y-1">
            <span
              className={`block w-4 h-0.5 bg-foreground transition-all duration-300 ${isMobileMenuOpen ? "rotate-45 translate-y-1.5" : ""}`}
            ></span>
            <span
              className={`block w-4 h-0.5 bg-foreground transition-all duration-300 ${isMobileMenuOpen ? "opacity-0" : ""}`}
            ></span>
            <span
              className={`block w-4 h-0.5 bg-foreground transition-all duration-300 ${isMobileMenuOpen ? "-rotate-45 -translate-y-1.5" : ""}`}
            ></span>
          </div>
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[9998] bg-background/80 backdrop-blur-sm md:hidden">
          <div className="absolute top-20 left-4 right-4 bg-background/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-2xl p-6">
            <nav className="flex flex-col space-y-4">
              <button
                onClick={() => handleMobileNavClick("features")}
                className="text-left px-4 py-3 text-lg font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-background/50"
              >
                Features
              </button>
              <button
                onClick={() => handleMobileNavClick("architecture")}
                className="text-left px-4 py-3 text-lg font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-background/50"
              >
                Architecture
              </button>
              <button
                onClick={() => handleMobileNavClick("docs")}
                className="text-left px-4 py-3 text-lg font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-background/50"
              >
                Docs
              </button>
              {/* <button
                onClick={() => handleMobileNavClick("pricing")}
                className="text-left px-4 py-3 text-lg font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-background/50"
              >
                Pricing
              </button> */}
              <button
                onClick={() => handleMobileNavClick("faq")}
                className="text-left px-4 py-3 text-lg font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-background/50"
              >
                FAQ
              </button>
              <div className="border-t border-border/50 pt-4 mt-4 flex flex-col space-y-3">
                {!isPending && (
                  user ? (
                    <Link
                      href="/workflows"
                      className="flex items-center justify-center gap-2 px-4 py-3 text-lg font-bold bg-gradient-to-b from-primary to-primary/80 text-primary-foreground rounded-lg shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                    >
                      <Zap className="size-5 fill-current" />
                      Go to Dashboard
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/signin"
                        className="px-4 py-3 text-lg font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-background/50 cursor-pointer"
                      >
                        Log In
                      </Link>
                      <Link
                        href="/signup"
                        className="px-4 py-3 text-lg font-bold text-center bg-gradient-to-b from-primary to-primary/80 text-primary-foreground rounded-lg shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                      >
                        Sign Up
                      </Link>
                    </>
                  )
                )}
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <Hero />

      {/* Features Section */}
      <div id="features">
        <Features />
      </div>

      {/* Architecture Section */}
      <div id="architecture">
        <InteractiveArchitecture />
      </div>

      {/* Docs Section */}
      <div id="docs">
        <DocsSection />
      </div>

      {/* Pricing Section */}
      {/* <div id="pricing">
        <PricingSection />
      </div> */}

      <NewReleasePromo />

      {/* FAQ Section */}
      <div id="faq">
        <FAQSection />
      </div>

      {/* Sticky Footer */}
      <StickyFooter />
    </div>
  )
}
