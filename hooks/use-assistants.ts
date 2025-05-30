"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { AssistantStatus } from "@prisma/client"

// Hook to get all assistants
export function useAssistants() {
  return useQuery({
    queryKey: ["assistants"],
    queryFn: async () => {
      const response = await fetch("/api/assistants")
      if (!response.ok) throw new Error("Failed to fetch assistants")
      return response.json()
    },
  })
}

// Hook to get specific assistant
export function useAssistant(id: string) {
  return useQuery({
    queryKey: ["assistants", id],
    queryFn: async () => {
      const response = await fetch(`/api/assistants/${id}`)
      if (!response.ok) throw new Error("Failed to fetch assistant")
      return response.json()
    },
    enabled: !!id,
  })
}

// Hook to create assistant
export function useCreateAssistant() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (formData: {
      name: string
      type: string
      instructions: string
      welcomeMessage: string
      deliveryMethod: string
      tone: string
      responseLength: string
    }) => {
      const response = await fetch("/api/assistants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (!response.ok) throw new Error("Failed to create assistant")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assistants"] })
      queryClient.invalidateQueries({ queryKey: ["user", "tokens"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] })
    },
  })
}

// Hook to update assistant status
export function useUpdateAssistantStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: AssistantStatus }) => {
      const response = await fetch(`/api/assistants/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!response.ok) throw new Error("Failed to update assistant status")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assistants"] })
    },
  })
}

// Hook to delete assistant
export function useDeleteAssistant() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/assistants/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Failed to delete assistant")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assistants"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] })
    },
  })
}

// Hook to duplicate assistant
export function useDuplicateAssistant() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/assistants/${id}/duplicate`, {
        method: "POST",
      })
      if (!response.ok) throw new Error("Failed to duplicate assistant")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assistants"] })
      queryClient.invalidateQueries({ queryKey: ["user", "tokens"] })
    },
  })
}
