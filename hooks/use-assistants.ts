import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getAssistants,
  createAssistant,
  deleteAssistant,
  duplicateAssistant,
  updateAssistantStatus,
} from "@/lib/actions/assistant-actions"
import type { AssistantStatus } from "@prisma/client"
import { toast } from "sonner"

export function useAssistants() {
  return useQuery({
    queryKey: ["assistants"],
    queryFn: getAssistants,
  })
}

export function useCreateAssistant() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createAssistant,
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["assistants"] })
        queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] })
        queryClient.invalidateQueries({ queryKey: ["user-tokens"] })
        toast.success(`Assistant created successfully! Used ${data.tokensUsed} tokens.`)
      } else {
        toast.error(data.error || "Failed to create assistant")
      }
    },
    onError: () => {
      toast.error("Failed to create assistant")
    },
  })
}

export function useDeleteAssistant() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteAssistant,
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["assistants"] })
        queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] })
        toast.success("Assistant deleted successfully")
      } else {
        toast.error(data.error || "Failed to delete assistant")
      }
    },
    onError: () => {
      toast.error("Failed to delete assistant")
    },
  })
}

export function useDuplicateAssistant() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: duplicateAssistant,
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["assistants"] })
        queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] })
        queryClient.invalidateQueries({ queryKey: ["user-tokens"] })
        toast.success("Assistant duplicated successfully")
      } else {
        toast.error(data.error || "Failed to duplicate assistant")
      }
    },
    onError: () => {
      toast.error("Failed to duplicate assistant")
    },
  })
}

export function useUpdateAssistantStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: AssistantStatus }) => updateAssistantStatus(id, status),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["assistants"] })
        toast.success("Assistant status updated")
      } else {
        toast.error(data.error || "Failed to update assistant status")
      }
    },
    onError: () => {
      toast.error("Failed to update assistant status")
    },
  })
}
