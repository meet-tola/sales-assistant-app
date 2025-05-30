"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

// Hook to get current user
export function useUser() {
  return useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const response = await fetch("/api/user")
      if (!response.ok) throw new Error("Failed to fetch user")
      return response.json()
    },
  })
}

// Hook to create user
export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/user", { method: "POST" })
      if (!response.ok) throw new Error("Failed to create user")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] })
    },
  })
}

// Hook to get user tokens
export function useUserTokens() {
  return useQuery({
    queryKey: ["user", "tokens"],
    queryFn: async () => {
      const response = await fetch("/api/user/tokens")
      if (!response.ok) throw new Error("Failed to fetch tokens")
      return response.json()
    },
  })
}

// Hook to deduct tokens
export function useDeductTokens() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      tokens,
      operation,
      assistantId,
      description,
    }: {
      tokens: number
      operation: string
      assistantId?: string
      description?: string
    }) => {
      const response = await fetch("/api/user/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokens, operation, assistantId, description }),
      })
      if (!response.ok) throw new Error("Failed to deduct tokens")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] })
      queryClient.invalidateQueries({ queryKey: ["user", "tokens"] })
      queryClient.invalidateQueries({ queryKey: ["user", "usage"] })
    },
  })
}

// Hook to add tokens
export function useAddTokens() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ tokens, reason }: { tokens: number; reason: string }) => {
      const response = await fetch("/api/user/tokens", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokens, reason }),
      })
      if (!response.ok) throw new Error("Failed to add tokens")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] })
      queryClient.invalidateQueries({ queryKey: ["user", "tokens"] })
      queryClient.invalidateQueries({ queryKey: ["user", "usage"] })
    },
  })
}

// Hook to get user usage
export function useUserUsage() {
  return useQuery({
    queryKey: ["user", "usage"],
    queryFn: async () => {
      const response = await fetch("/api/user/usage")
      if (!response.ok) throw new Error("Failed to fetch usage")
      return response.json()
    },
  })
}

// Hook to upgrade plan
export function useUpgradePlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (newPlan: "STARTER" | "PRO" | "ENTERPRISE") => {
      const response = await fetch("/api/user/plan", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPlan }),
      })
      if (!response.ok) throw new Error("Failed to upgrade plan")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] })
      queryClient.invalidateQueries({ queryKey: ["user", "usage"] })
    },
  })
}

// Hook to get token usage history
export function useTokenHistory() {
  return useQuery({
    queryKey: ["user", "token-history"],
    queryFn: async () => {
      const response = await fetch("/api/user/token-history")
      if (!response.ok) throw new Error("Failed to fetch token history")
      return response.json()
    },
  })
}
