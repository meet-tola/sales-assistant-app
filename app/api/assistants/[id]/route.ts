import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { AssistantStatus } from "@prisma/client"

// GET /api/assistants/[id] - Get specific assistant
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getCurrentUser()
    const assistantId = params.id

    const assistant = await prisma.assistant.findUnique({
      where: { id: assistantId, userId },
    })

    if (!assistant) {
      return NextResponse.json({ error: "Assistant not found" }, { status: 404 })
    }

    return NextResponse.json(assistant)
  } catch (error) {
    console.error("Error fetching assistant:", error)
    return NextResponse.json({ error: "Failed to fetch assistant" }, { status: 500 })
  }
}

// PUT /api/assistants/[id] - Update assistant status
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getCurrentUser()
    const { status } = await request.json()
    const assistantId = params.id

    if (!Object.values(AssistantStatus).includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const assistant = await prisma.assistant.update({
      where: { id: assistantId, userId },
      data: { status },
    })

    return NextResponse.json({ success: true, assistant })
  } catch (error) {
    console.error("Error updating assistant status:", error)
    return NextResponse.json({ error: "Failed to update assistant status" }, { status: 500 })
  }
}

// DELETE /api/assistants/[id] - Delete assistant
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getCurrentUser()
    const assistantId = params.id

    await prisma.assistant.delete({
      where: { id: assistantId, userId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting assistant:", error)
    return NextResponse.json({ error: "Failed to delete assistant" }, { status: 500 })
  }
}
