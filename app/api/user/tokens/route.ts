import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

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

    if (!tokens || !operation) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if user has enough tokens
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { tokens: true },
    })

    if (!user || user.tokens < tokens) {
      return NextResponse.json({ error: "Insufficient tokens" }, { status: 400 })
    }

    // Deduct tokens and log usage
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          tokens: {
            decrement: tokens,
          },
        },
      }),
      prisma.tokenUsage.create({
        data: {
          userId,
          assistantId,
          operation,
          tokens,
          description,
        },
      }),
    ])

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
