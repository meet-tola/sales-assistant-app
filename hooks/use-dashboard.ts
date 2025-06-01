"use client"

import { useQuery } from "@tanstack/react-query"

// Hook to get dashboard stats
export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: async () => {
      const response = await fetch("/api/user/dashboard/stats")
      if (!response.ok) throw new Error("Failed to fetch dashboard stats")
      return response.json()
    },
  })
}

// Hook to get recent activity
export function useRecentActivity() {
  return useQuery({
    queryKey: ["dashboard", "activity"],
    queryFn: async () => {
      const response = await fetch("/api/user/dashboard/activity")
      if (!response.ok) throw new Error("Failed to fetch recent activity")
      return response.json()
    },
  })
}
