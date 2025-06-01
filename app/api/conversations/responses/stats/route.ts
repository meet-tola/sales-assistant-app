import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { ConversationStatus } from "@prisma/client"

// GET /api/conversations/responses/stats - Get response statistics
export async function GET() {
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

    const stats = {
      totalResponses,
      completionRate,
      avgMessages,
      uniqueUsers: uniqueUsers.length,
      totalTokensUsed: totalTokensUsed._sum.tokensUsed || 0,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching responses stats:", error)
    return NextResponse.json(
      {
        totalResponses: 0,
        completionRate: 0,
        avgMessages: 0,
        uniqueUsers: 0,
        totalTokensUsed: 0,
      },
      { status: 500 },
    )
  }
}
