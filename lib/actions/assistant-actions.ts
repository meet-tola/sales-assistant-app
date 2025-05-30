"use server"

import prisma from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { type AssistantType, type DeliveryMethod, AssistantStatus } from "@prisma/client"
import { calculateInstructionTokens } from "@/lib/gemini"
import { deductTokens } from "./user-actions"

export async function createAssistant(formData: {
  name: string
  type: string
  instructions: string
  welcomeMessage: string
  deliveryMethod: string
  tone: string
  responseLength: string
}) {
  try {
    const userId = await getCurrentUser()

    // Validate required fields
    if (
      !formData.name ||
      !formData.type ||
      !formData.instructions ||
      !formData.welcomeMessage ||
      !formData.deliveryMethod
    ) {
      throw new Error("All fields are required")
    }

    // Calculate tokens needed for instructions
    const instructionTokens = calculateInstructionTokens(formData.instructions, formData.welcomeMessage)
    const baseCreationTokens = 100 // Base cost for creating assistant
    const totalTokens = instructionTokens + baseCreationTokens

    // Check if user has enough tokens
    const tokenResult = await deductTokens(
      totalTokens,
      "create_assistant",
      undefined,
      `Created assistant: ${formData.name} (${instructionTokens} instruction tokens + ${baseCreationTokens} base cost)`,
    )

    if (!tokenResult.success) {
      return { success: false, error: tokenResult.error }
    }

    // Create assistant
    const assistant = await prisma.assistant.create({
      data: {
        name: formData.name,
        type: formData.type.toUpperCase() as AssistantType,
        instructions: formData.instructions,
        welcomeMessage: formData.welcomeMessage,
        deliveryMethod: formData.deliveryMethod.toUpperCase() as DeliveryMethod,
        tone: formData.tone,
        responseLength: formData.responseLength,
        status: AssistantStatus.ACTIVE,
        tokensUsed: instructionTokens,
        userId,
      },
    })

    revalidatePath("/assistants")
    return { success: true, assistant, tokensUsed: totalTokens }
  } catch (error) {
    console.error("Error creating assistant:", error)
    return { success: false, error: "Failed to create assistant" }
  }
}

export async function getAssistants() {
  try {
    const userId = await getCurrentUser()

    const assistants = await prisma.assistant.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    })

    return assistants
  } catch (error) {
    console.error("Error fetching assistants:", error)
    return []
  }
}

export async function getAssistant(id: string) {
  try {
    const userId = await getCurrentUser()

    const assistant = await prisma.assistant.findUnique({
      where: { id, userId },
    })

    return assistant
  } catch (error) {
    console.error("Error fetching assistant:", error)
    return null
  }
}

export async function updateAssistantStatus(id: string, status: AssistantStatus) {
  try {
    const userId = await getCurrentUser()

    const assistant = await prisma.assistant.update({
      where: { id, userId },
      data: { status },
    })

    revalidatePath("/assistants")
    return { success: true, assistant }
  } catch (error) {
    console.error("Error updating assistant status:", error)
    return { success: false, error: "Failed to update assistant status" }
  }
}

export async function deleteAssistant(id: string) {
  try {
    const userId = await getCurrentUser()

    await prisma.assistant.delete({
      where: { id, userId },
    })

    revalidatePath("/assistants")
    return { success: true }
  } catch (error) {
    console.error("Error deleting assistant:", error)
    return { success: false, error: "Failed to delete assistant" }
  }
}

export async function duplicateAssistant(id: string) {
  try {
    const userId = await getCurrentUser()

    const originalAssistant = await prisma.assistant.findUnique({
      where: { id, userId },
    })

    if (!originalAssistant) {
      throw new Error("Assistant not found")
    }

    // Calculate tokens for duplication (same as creation)
    const instructionTokens = calculateInstructionTokens(
      originalAssistant.instructions,
      originalAssistant.welcomeMessage,
    )
    const baseCreationTokens = 100
    const totalTokens = instructionTokens + baseCreationTokens

    // Check if user has enough tokens
    const tokenResult = await deductTokens(
      totalTokens,
      "duplicate_assistant",
      id,
      `Duplicated assistant: ${originalAssistant.name}`,
    )

    if (!tokenResult.success) {
      return { success: false, error: tokenResult.error }
    }

    const duplicatedAssistant = await prisma.assistant.create({
      data: {
        name: `${originalAssistant.name} (Copy)`,
        type: originalAssistant.type,
        instructions: originalAssistant.instructions,
        welcomeMessage: originalAssistant.welcomeMessage,
        deliveryMethod: originalAssistant.deliveryMethod,
        tone: originalAssistant.tone,
        responseLength: originalAssistant.responseLength,
        status: AssistantStatus.DRAFT,
        tokensUsed: instructionTokens,
        userId,
      },
    })

    revalidatePath("/assistants")
    return { success: true, assistant: duplicatedAssistant }
  } catch (error) {
    console.error("Error duplicating assistant:", error)
    return { success: false, error: "Failed to duplicate assistant" }
  }
}

export async function getDashboardStats() {
  try {
    const userId = await getCurrentUser()

    const [assistantCount, totalInteractions, user] = await Promise.all([
      prisma.assistant.count({
        where: { userId },
      }),
      prisma.assistant.aggregate({
        where: { userId },
        _sum: { interactions: true },
      }),
      prisma.user.findUnique({
        where: { id: userId },
      }),
    ])

    return {
      assistantCount,
      totalInteractions: totalInteractions._sum.interactions || 0,
      tokens: user?.tokens || 0,
    }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return {
      assistantCount: 0,
      totalInteractions: 0,
      tokens: 0,
    }
  }
}

export async function getRecentActivity() {
  try {
    const userId = await getCurrentUser()

    const assistants = await prisma.assistant.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: 4,
      select: {
        id: true,
        name: true,
        type: true,
        status: true,
        interactions: true,
        updatedAt: true,
      },
    })

    return assistants.map((assistant) => ({
      ...assistant,
      lastActive: getRelativeTime(assistant.updatedAt),
    }))
  } catch (error) {
    console.error("Error fetching recent activity:", error)
    return []
  }
}

function getRelativeTime(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return "Just now"
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  return `${Math.floor(diffInSeconds / 86400)} days ago`
}
