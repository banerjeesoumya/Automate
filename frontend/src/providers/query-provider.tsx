"use client";

import { useAuthCacheSync } from "@/hooks/useAuthCache";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ReactNode, useState } from "react";


function InnerQueryProvider({ children }: { children: ReactNode }) {
  // ✅ Hook runs inside QueryClientProvider context
  useAuthCacheSync()
  return <>{children}</>;
}

export const QueryProvider = ({ children }: { children: ReactNode }) => {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 1000 * 60, // 1 minute cache freshness
          },
        },
      })
  );

  return (
    <QueryClientProvider client={client}>
      <InnerQueryProvider>{children}</InnerQueryProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};
