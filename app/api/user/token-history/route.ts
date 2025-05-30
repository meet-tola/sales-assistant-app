import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

// GET /api/user/token-history - Get token usage history
export async function GET() {
  try {
    const userId = await getCurrentUser()
    if (!userId) {
      return NextResponse.json({ error: "No authenticated user ID found" }, { status: 401 })
    }

    const usage = await prisma.tokenUsage.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        user: {
          select: { name: true },
        },
      },
    })

    return NextResponse.json(usage)
  } catch (error) {
    console.error("Error fetching token usage history:", error)
    return NextResponse.json({ error: "Failed to fetch token history" }, { status: 500 })
  }
}
