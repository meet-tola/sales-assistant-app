import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

// GET /api/user/dashboard/stats - Get user dashboard statistics
export async function GET() {
  try {
    const userId = await getCurrentUser()

    const [assistantCount, totalInteractions, user] = await Promise.all([
      prisma.assistant.count({
        where: { userId },
      }),
      prisma.assistant.aggregate({
        where: { userId },
        _sum: { interactions: true },
      }),
      prisma.user.findUnique({
        where: { id: userId },
      }),
    ])

    const stats = {
      assistantCount,
      totalInteractions: totalInteractions._sum.interactions || 0,
      tokens: user?.tokens || 0,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json(
      {
        assistantCount: 0,
        totalInteractions: 0,
        tokens: 0,
      },
      { status: 500 },
    )
  }
}
