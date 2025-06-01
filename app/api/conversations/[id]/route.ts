import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getCurrentUserOptional } from "@/lib/auth"
import { ConversationStatus } from "@prisma/client"

// GET /api/conversations/[id] - Get specific conversation
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getCurrentUserOptional()
    const conversationId = params.id

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
        return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
      }
    }

    return NextResponse.json(conversation)
  } catch (error) {
    console.error("Error fetching conversation:", error)
    return NextResponse.json({ error: "Failed to fetch conversation" }, { status: 500 })
  }
}

// PUT /api/conversations/[id] - Update conversation status
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getCurrentUserOptional()
    if (!userId) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 })
    }

    const { status } = await request.json()
    const conversationId = params.id

    if (!Object.values(ConversationStatus).includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const conversation = await prisma.conversation.update({
      where: { id: conversationId, userId },
      data: { status },
    })

    return NextResponse.json({ success: true, conversation })
  } catch (error) {
    console.error("Error updating conversation status:", error)
    return NextResponse.json({ error: "Failed to update conversation status" }, { status: 500 })
  }
}
