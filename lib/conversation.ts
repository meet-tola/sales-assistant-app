import prisma from "@/lib/prisma"
import { ConversationStatus } from "@prisma/client"
import { getCurrentUserOptional } from "./auth"

export async function getConversation(conversationId: string) {
  return await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  })
}

export async function startConversation(assistantId: string, userEmail: string) {
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

    return { success: true, conversation }
  } catch (error) {
    return { success: false, error: "Failed to start conversation" }
  }
}

export async function sendMessage(conversationId: string, message: string) {
  try {
    await prisma.message.create({
      data: {
        conversationId,
        content: message,
        role: "USER",
        tokens: 0,
      },
    })

    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to send message" }
  }
}
