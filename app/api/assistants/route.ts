import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { type AssistantType, type DeliveryMethod, AssistantStatus } from "@prisma/client"
import { calculateInstructionTokens } from "@/lib/gemini"
import { deductTokens } from "@/lib/token"

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

        if (
            !formData.name ||
            !formData.type ||
            !formData.instructions ||
            !formData.welcomeMessage ||
            !formData.deliveryMethod
        ) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 })
        }

        const instructionTokens = calculateInstructionTokens(formData.instructions, formData.welcomeMessage)
        const baseCreationTokens = 100
        const totalTokens = instructionTokens + baseCreationTokens

        const tokenResult = await deductTokens({
            userId,
            tokens: totalTokens,
            operation: "create_assistant",
            description: `Created assistant: ${formData.name} (${instructionTokens} instruction tokens + ${baseCreationTokens} base cost)`,
        })

        if ("error" in tokenResult) {
            return NextResponse.json({ error: tokenResult.error }, { status: 400 })
        }

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

        return NextResponse.json({ success: true, assistant, tokensUsed: totalTokens }, { status: 201 })
    } catch (error) {
        console.error("Error creating assistant:", error)
        return NextResponse.json({ error: "Failed to create assistant" }, { status: 500 })
    }
}
