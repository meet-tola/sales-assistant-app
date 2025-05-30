import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { type AssistantType, type DeliveryMethod, AssistantStatus } from "@prisma/client"
import { calculateInstructionTokens } from "@/lib/gemini"

// GET /api/assistants - Get all assistants
export async function GET() {
  try {
    const userId = await getCurrentUser()

    const assistants = await prisma.assistant.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(assistants)
  } catch (error) {
    console.error("Error fetching assistants:", error)
    return NextResponse.json({ error: "Failed to fetch assistants" }, { status: 500 })
  }
}

// POST /api/assistants - Create new assistant
export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUser()
    const formData = await request.json()

    // Validate required fields
    if (
      !formData.name ||
      !formData.type ||
      !formData.instructions ||
      !formData.welcomeMessage ||
      !formData.deliveryMethod
    ) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    console.log("Creating assistant with data:", formData)
    // Calculate tokens needed for instructions
    const instructionTokens = calculateInstructionTokens(formData.instructions, formData.welcomeMessage)
    const baseCreationTokens = 100 // Base cost for creating assistant
    const totalTokens = instructionTokens + baseCreationTokens

    // Check if user has enough tokens
    const tokenResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/user/tokens`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tokens: totalTokens,
        operation: "create_assistant",
        description: `Created assistant: ${formData.name} (${instructionTokens} instruction tokens + ${baseCreationTokens} base cost)`,
      }),
    })

    if (!tokenResponse.ok) {
      const tokenError = await tokenResponse.json()
      return NextResponse.json({ error: tokenError.error }, { status: 400 })
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

    console.log(`Assistant created: ${assistant.name} (ID: ${assistant.id})`)   
    return NextResponse.json({ success: true, assistant, tokensUsed: totalTokens }, { status: 201 })
  } catch (error) {
    console.error("Error creating assistant:", error)
    return NextResponse.json({ error: "Failed to create assistant" }, { status: 500 })
  }
}
