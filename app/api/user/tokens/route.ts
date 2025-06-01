import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { deductTokens } from "@/lib/token"

// GET /api/user/tokens - Get user tokens
export async function GET() {
  try {
    const userId = await getCurrentUser()
    if (!userId) {
      return NextResponse.json({ error: "No authenticated user ID found" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { tokens: true, plan: true },
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching user tokens:", error)
    return NextResponse.json({ error: "Failed to fetch tokens" }, { status: 500 })
  }
}

// POST /api/user/tokens - Deduct tokens
export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUser()
    if (!userId) {
      return NextResponse.json({ error: "No authenticated user ID found" }, { status: 401 })
    }

    const { tokens, operation, assistantId, description } = await request.json()

    const result = await deductTokens({
      userId,
      tokens,
      operation,
      assistantId,
      description,
    })

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deducting tokens:", error)
    return NextResponse.json({ error: "Failed to deduct tokens" }, { status: 500 })
  }
}

// PUT /api/user/tokens - Add tokens
export async function PUT(request: NextRequest) {
  try {
    const userId = await getCurrentUser()
    if (!userId) {
      return NextResponse.json({ error: "No authenticated user ID found" }, { status: 401 })
    }

    const { tokens, reason } = await request.json()

    if (!tokens || !reason) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        tokens: {
          increment: tokens,
        },
      },
    })

    await prisma.tokenUsage.create({
      data: {
        userId,
        operation: "token_purchase",
        tokens: -tokens, // Negative for credits
        description: reason,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error adding tokens:", error)
    return NextResponse.json({ error: "Failed to add tokens" }, { status: 500 })
  }
}
