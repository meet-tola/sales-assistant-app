"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getUser,
  createUser,
  getUserTokens,
  getUserUsage,
  upgradePlan,
  addTokens,
  getTokenUsageHistory,
} from "@/lib/actions/user-actions"
import { toast } from "sonner"

export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ["user"],
    mutationFn: createUser,
    onSuccess: (data) => {
      if (data) {
        console.log("User created successfully:", data)
      } else {
        toast.error("Failed to create user")
      }
    },
    onError: (error) => {
      console.error("User creation failed:", error)
      toast.error("Error creating user")
    },
  })
}

export function useUser() {
  return useQuery({
    queryKey: ["user"],
    queryFn: getUser,
  })
}

export function useUserTokens() {
  return useQuery({
    queryKey: ["user-tokens"],
    queryFn: getUserTokens,
    refetchInterval: 30000,
  })
}

export function useUserUsage() {
  return useQuery({
    queryKey: ["user-usage"],
    queryFn: getUserUsage,
  })
}

export function useTokenUsageHistory() {
  return useQuery({
    queryKey: ["token-usage-history"],
    queryFn: getTokenUsageHistory,
  })
}

export function useUpgradePlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: upgradePlan,
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["user"] })
        queryClient.invalidateQueries({ queryKey: ["user-tokens"] })
        queryClient.invalidateQueries({ queryKey: ["user-usage"] })
        toast.success("Plan upgraded successfully!")
      } else {
        toast.error(data.error || "Failed to upgrade plan")
      }
    },
    onError: () => {
      toast.error("Failed to upgrade plan")
    },
  })
}

export function useAddTokens() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ tokens, reason }: { tokens: number; reason: string }) => addTokens(tokens, reason),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["user-tokens"] })
        queryClient.invalidateQueries({ queryKey: ["user-usage"] })
        toast.success("Tokens added successfully!")
      } else {
        toast.error(data.error || "Failed to add tokens")
      }
    },
    onError: () => {
      toast.error("Failed to add tokens")
    },
  })
}
