import { QueryClient } from "@tanstack/react-query";

const defaultQueryFn = async ({ queryKey }: { queryKey: string[] }) => {
  const url = queryKey[0];
  const res = await fetch(url, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error(`Network response was not ok: ${res.statusText}`);
  }

  return res.json();
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: defaultQueryFn,
      staleTime: 1000 * 60, // 1 minute
      retry: 1,
    },
  },
});

// Helper for authenticated requests (frontend only - uses fetch API)
export const apiRequest = async (url: string, options?: RequestInit) => {
  const res = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    throw new Error(`API request failed: ${res.statusText}`);
  }

  return res.json();
};