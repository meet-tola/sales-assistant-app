import { useQuery } from "@tanstack/react-query"

export function useConversations() {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const response = await fetch("/api/conversations")
      if (!response.ok) throw new Error("Failed to fetch conversations")
      return response.json()
    },
  })
}

// Hook to get recent activity
export function useResponsesStats() {
  return useQuery({
    queryKey: ["responses-stats"],
   queryFn: async () => {
      const response = await fetch("/api/conversations/responses/stats")
      if (!response.ok) throw new Error("Failed to fetch response stats")
      return response.json()
    },
  })
}
