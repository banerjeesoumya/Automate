"use client"

import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { authClient } from "@/lib/auth-client"

export function useAuthCacheSync() {
  const queryClient = useQueryClient()
  const { data: session } = authClient.useSession()

  useEffect(() => {
    queryClient.clear()
  }, [session?.user?.id])
}
