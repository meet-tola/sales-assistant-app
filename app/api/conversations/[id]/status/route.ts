import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { ConversationStatus } from "@prisma/client"

// PUT /api/conversations/[id]/status - Update conversation status
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getCurrentUser()
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
