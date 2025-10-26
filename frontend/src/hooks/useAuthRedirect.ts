"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { toast } from "sonner"
// import { authClient } from "../authClient"

export function useAuthRedirect({ requireAuth = false, requireNoAuth = false } = {}) {
  const router = useRouter()
  const pathname = usePathname()
  const { data: session, isPending } = authClient.useSession()

  useEffect(() => {
    if (isPending) return

    // 🚫 If the page should be hidden from signed-in users
    if (requireNoAuth && session?.user) {
      router.replace("/")
      return
    }

    // 🔒 If the page requires authentication
    if (requireAuth && !session?.user) {
      router.replace("/signin")
      toast.info("You must be signed in to access that page.")
      return
    }

    // Optional generic redirection logic (same as before)
    // if (!requireAuth && !requireNoAuth && !isPending) {
    //   if (session?.user && (pathname === "/signin" || pathname === "/signup")) {
    //     router.replace("/")
    //   } else if (!session?.user && (pathname === "/" || pathname === "/workflows" || pathname.startsWith("/workflows/"))) {
    //     router.replace("/signin")
    //   }
    // }
  }, [session, isPending, pathname, router, requireAuth, requireNoAuth])

  return { session, user: session?.user, isPending }
}
