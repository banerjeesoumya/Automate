"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { credsApi } from "@/lib/api";

export function useAuthRedirect({ requireAuth = false, requireNoAuth = false } = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: betterAuthSession, isPending } = authClient.useSession();
  const [manualSession, setManualSession] = useState<any>(null);
  const [loadingManual, setLoadingManual] = useState(true);

  useEffect(() => {
    console.log("🔍 Checking hybrid session...");

    // 1️⃣ If BetterAuth has a session, skip manual creds check
    if (betterAuthSession?.user) {
      console.log("✅ BetterAuth session found, skipping manual check");
      setLoadingManual(false);
      return;
    }

    // 2️⃣ Otherwise, check manual creds session
    credsApi
      .getSession()
      .then((res) => {
        console.log("📦 Creds API /get-session response:", res);
        // @ts-ignore
        if (res?.user) {
          console.log("✅ Manual credentials session found");
          setManualSession(res);
        } else {
          console.log("❌ No manual session found");
          setManualSession(null);
        }
      })
      .catch((err) => {
        console.error("⚠️ Manual session check failed:", err);
        setManualSession(null);
      })
      .finally(() => setLoadingManual(false));
  }, [betterAuthSession]);

  // 3️⃣ Merge both auth systems
  const user = betterAuthSession?.user || manualSession?.user;
  const isAuthenticated = Boolean(user);
  const isLoading = isPending || loadingManual;

  useEffect(() => {
    if (isLoading) return;

    if (requireNoAuth && isAuthenticated) {
      router.replace("/");
      return;
    }

    if (requireAuth && !isAuthenticated) {
      router.replace("/signin");
      return;
    }
  }, [requireAuth, requireNoAuth, isAuthenticated, isLoading, pathname]);

  return {
    session: betterAuthSession || manualSession?.session,
    user,
    isPending: isLoading,
  };
}
