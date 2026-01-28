"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function useAuthRedirect({ requireAuth = false, requireNoAuth = false } = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: betterAuthSession, isPending } = authClient.useSession();

  const user = betterAuthSession?.user;
  const isAuthenticated = Boolean(user);
  const isLoading = isPending;

  useEffect(() => {
    if (isLoading) return;

    if (requireNoAuth && isAuthenticated) {
      router.replace("/workflows");
      return;
    }

    if (requireAuth && !isAuthenticated) {
      router.replace("/signin");
      return;
    }
  }, [requireAuth, requireNoAuth, isAuthenticated, isLoading, pathname, router]);

  return {
    session: betterAuthSession?.session,
    user,
    isPending: isLoading,
  };
}
