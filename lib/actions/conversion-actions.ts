"use server"

import prisma from "@/lib/prisma"
import { getCurrentUser, getCurrentUserOptional } from "@/lib/auth"
import { generateAIResponse } from "@/lib/gemini"
import { revalidatePath } from "next/cache"
import { ConversationStatus } from "@prisma/client"
import { deductTokens } from "./user-actions"

export async function startConversation(assistantId: string, userEmail?: string) {
  try {
    const userId = await getCurrentUserOptional()

    if (!userId) {
      throw new Error("User not authenticated")
    }

    const assistant = await prisma.assistant.findUnique({
      where: { id: assistantId },
    })

    if (!assistant) {
      throw new Error("Assistant not found")
    }

    const conversation = await prisma.conversation.create({
      data: {
        assistantId,
        userId,
        userEmail,
        status: ConversationStatus.ACTIVE,
      },
    })

    // Create welcome message
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        content: assistant.welcomeMessage,
        role: "ASSISTANT",
        tokens: 0, // Welcome message doesn't cost tokens
      },
    })

    return { success: true, conversation }
  } catch (error) {
    console.error("Error starting conversation:", error)
    return { success: false, error: "Failed to start conversation" }
  }
}

export async function sendMessage(conversationId: string, userMessage: string) {
  try {
    const userId = await getCurrentUserOptional()

    if (!userId) {
      throw new Error("User not authenticated")
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        assistant: true,
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    })

    if (!conversation) {
      throw new Error("Conversation not found")
    }

    // Save user message
    await prisma.message.create({
      data: {
        conversationId,
        content: userMessage,
        role: "USER",
        tokens: 0, // User messages don't cost tokens
      },
    })

    // Prepare conversation history for AI
    const conversationHistory = conversation.messages.map((msg) => ({
      role: msg.role.toLowerCase() as "user" | "assistant",
      content: msg.content,
    }))

    // Generate AI response
    const aiResult = await generateAIResponse(
      conversation.assistant.instructions,
      conversationHistory,
      userMessage,
      conversation.assistant.type,
      conversation.assistant.tone,
      conversation.assistant.responseLength,
    )

    // Check if user has enough tokens for the AI response
    const tokenResult = await deductTokens(
      aiResult.tokensUsed,
      "chat_message",
      conversation.assistantId,
      `AI response in conversation ${conversationId}`,
    )

    if (!tokenResult.success) {
      // Save an error message instead
      const errorMessage = await prisma.message.create({
        data: {
          conversationId,
          content: "I apologize, but you've run out of tokens. Please upgrade your plan to continue chatting.",
          role: "ASSISTANT",
          tokens: 0,
        },
      })

      return { success: false, error: "Insufficient tokens", message: errorMessage }
    }

    // Save AI response
    const assistantMessage = await prisma.message.create({
      data: {
        conversationId,
        content: aiResult.response,
        role: "ASSISTANT",
        tokens: aiResult.tokensUsed,
      },
    })

    // Update conversation and assistant stats
    await prisma.$transaction([
      prisma.conversation.update({
        where: { id: conversationId },
        data: {
          tokensUsed: {
            increment: aiResult.tokensUsed,
          },
        },
      }),
      prisma.assistant.update({
        where: { id: conversation.assistantId },
        data: {
          interactions: {
            increment: 1,
          },
          tokensUsed: {
            increment: aiResult.tokensUsed,
          },
        },
      }),
    ])

    return { success: true, message: assistantMessage, tokensUsed: aiResult.tokensUsed }
  } catch (error) {
    console.error("Error sending message:", error)
    return { success: false, error: "Failed to send message" }
  }
}

export async function getConversation(conversationId: string) {
  try {
    const userId = await getCurrentUserOptional()

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        assistant: true,
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    })

    // Allow public access for widget conversations, but verify ownership for dashboard access
    if (conversation && conversation.userId !== userId) {
      // Only allow if it's a public widget conversation
      if (!conversationId.startsWith("widget_")) {
        return null
      }
    }

    return conversation
  } catch (error) {
    console.error("Error fetching conversation:", error)
    return null
  }
}

export async function getConversations() {
  try {
    const userId = await getCurrentUser()

    const conversations = await prisma.conversation.findMany({
      where: { userId },
      include: {
        assistant: true,
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return conversations.map((conv) => ({
      id: conv.id,
      assistant: conv.assistant.name,
      user: conv.userEmail || "Anonymous",
      timestamp: conv.createdAt.toISOString().slice(0, 16).replace("T", " "),
      type: conv.assistant.type,
      status: conv.status.toLowerCase(),
      messages: conv.messages.length,
      tokensUsed: conv.tokensUsed,
      summary: generateSummary(conv.messages),
      fullConversation: conv.messages.map((msg) => ({
        role: msg.role.toLowerCase(),
        content: msg.content,
        tokens: msg.tokens,
      })),
    }))
  } catch (error) {
    console.error("Error fetching conversations:", error)
    return []
  }
}

export async function updateConversationStatus(conversationId: string, status: ConversationStatus) {
  try {
    const userId = await getCurrentUser()

    const conversation = await prisma.conversation.update({
      where: { id: conversationId, userId },
      data: { status },
    })

    revalidatePath("/responses")
    return { success: true, conversation }
  } catch (error) {
    console.error("Error updating conversation status:", error)
    return { success: false, error: "Failed to update conversation status" }
  }
}

function generateSummary(messages: any[]): string {
  const userMessages = messages.filter((msg) => msg.role === "USER")
  if (userMessages.length === 0) return "No user messages"

  const firstUserMessage = userMessages[0]?.content || ""
  const lastUserMessage = userMessages[userMessages.length - 1]?.content || ""

  if (userMessages.length === 1) {
    return firstUserMessage.length > 50 ? firstUserMessage.substring(0, 50) + "..." : firstUserMessage
  }

  return `Started with: ${firstUserMessage.substring(0, 30)}... Latest: ${lastUserMessage.substring(0, 30)}...`
}

export async function getResponsesStats() {
  try {
    const userId = await getCurrentUser()

    const [totalResponses, completedResponses, totalMessages, uniqueUsers, totalTokensUsed] = await Promise.all([
      prisma.conversation.count({
        where: { userId },
      }),
      prisma.conversation.count({
        where: {
          userId,
          status: ConversationStatus.COMPLETED,
        },
      }),
      prisma.message.count({
        where: {
          conversation: {
            userId,
          },
        },
      }),
      prisma.conversation.groupBy({
        by: ["userEmail"],
        where: {
          userId,
          userEmail: { not: null },
        },
      }),
      prisma.conversation.aggregate({
        where: { userId },
        _sum: { tokensUsed: true },
      }),
    ])

    const completionRate = totalResponses > 0 ? Math.round((completedResponses / totalResponses) * 100) : 0
    const avgMessages = totalResponses > 0 ? Math.round(totalMessages / totalResponses) : 0

    return {
      totalResponses,
      completionRate,
      avgMessages,
      uniqueUsers: uniqueUsers.length,
      totalTokensUsed: totalTokensUsed._sum.tokensUsed || 0,
    }
  } catch (error) {
    console.error("Error fetching responses stats:", error)
    return {
      totalResponses: 0,
      completionRate: 0,
      avgMessages: 0,
      uniqueUsers: 0,
      totalTokensUsed: 0,
    }
  }
}
