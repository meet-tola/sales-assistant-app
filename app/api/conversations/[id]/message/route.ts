import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getCurrentUserOptional } from "@/lib/auth"
import { generateAIResponse } from "@/lib/gemini"
import { deductTokens } from "@/lib/token"

// POST /api/conversations/[id]/messages - Send message
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const userId = await getCurrentUserOptional()

        if (!userId) {
            return NextResponse.json({ error: "User not authenticated" }, { status: 401 })
        }

        const { userMessage } = await request.json()
        const conversationId = params.id

        if (!userMessage) {
            return NextResponse.json({ error: "Message content is required" }, { status: 400 })
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
            return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
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
        const tokenResult = await deductTokens({
            userId,
            tokens: aiResult.tokensUsed,
            operation: "chat_message",
            assistantId: conversation.assistantId,
            description: `AI response in conversation ${conversationId}`,
        })

        if ("error" in tokenResult) {
            const errorMessage = await prisma.message.create({
                data: {
                    conversationId,
                    content: "I apologize, but you've run out of tokens. Please upgrade your plan to continue chatting.",
                    role: "ASSISTANT",
                    tokens: 0,
                },
            })

            return NextResponse.json(
                {
                    success: false,
                    error: "Insufficient tokens",
                    message: errorMessage,
                },
                { status: 400 },
            )
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

        return NextResponse.json({
            success: true,
            message: assistantMessage,
            tokensUsed: aiResult.tokensUsed,
        })
    } catch (error) {
        console.error("Error sending message:", error)
        return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
    }
}
