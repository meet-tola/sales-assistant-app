import { useQuery } from "@tanstack/react-query"
import { getDashboardStats, getRecentActivity } from "@/lib/actions/assistant-actions"

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: getDashboardStats,
  })
}

export function useRecentActivity() {
  return useQuery({
    queryKey: ["recent-activity"],
    queryFn: getRecentActivity,
  })
}
