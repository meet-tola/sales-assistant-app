import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

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

// GET /api/conversations/responses - Get all conversations with formatted response data
export async function GET() {
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

    const formattedConversations = conversations.map((conv) => ({
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

    return NextResponse.json(formattedConversations)
  } catch (error) {
    console.error("Error fetching conversations:", error)
    return NextResponse.json([], { status: 500 })
  }
}
