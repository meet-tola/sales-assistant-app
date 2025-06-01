import { type NextRequest, NextResponse } from "next/server"
import { startConversation, sendMessage, getConversation } from "@/lib/conversation"
import { getAssistant } from "@/lib/assistant"
export async function POST(request: NextRequest, { params }: { params: { assistantId: string } }) {
  try {
    const { message, conversationId, userEmail } = await request.json()

    // If no conversation ID, start a new conversation
    if (!conversationId) {
      const assistant = await getAssistant(params.assistantId)
      if (!assistant) {
        return NextResponse.json({ error: "Assistant not found" }, { status: 404 })
      }

      const result = await startConversation(params.assistantId, userEmail)
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 500 })
      }

      const conversation = await getConversation(result.conversation!.id)
      return NextResponse.json({
        conversationId: result.conversation!.id,
        messages:
          conversation?.messages.map((msg) => ({
            role: msg.role.toLowerCase(),
            content: msg.content,
            timestamp: msg.createdAt,
          })) || [],
      })
    }

    // Send message to existing conversation
    const result = await sendMessage(conversationId, message)
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    const conversation = await getConversation(conversationId)
    return NextResponse.json({
      conversationId,
      messages:
        conversation?.messages.map((msg) => ({
          role: msg.role.toLowerCase(),
          content: msg.content,
          timestamp: msg.createdAt,
        })) || [],
    })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: { assistantId: string } }) {
  try {
    const assistant = await getAssistant(params.assistantId)
    if (!assistant) {
      return NextResponse.json({ error: "Assistant not found" }, { status: 404 })
    }

    return NextResponse.json({
      id: assistant.id,
      name: assistant.name,
      type: assistant.type,
      welcomeMessage: assistant.welcomeMessage,
      status: assistant.status,
    })
  } catch (error) {
    console.error("Assistant API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
