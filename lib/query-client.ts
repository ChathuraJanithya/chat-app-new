import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: (failureCount, error) => {
        // Don't retry on auth errors
        if (error && typeof error === "object" && "code" in error) {
          if (error.code === "PGRST301" || error.code === "PGRST116") {
            return false;
          }
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false, // Prevent refetch on tab switch
      refetchOnMount: true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});
