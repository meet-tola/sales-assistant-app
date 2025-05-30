import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

function getPlanTokens(plan: string): number {
  const planTokens = {
    STARTER: 5000,
    PRO: 25000,
    ENTERPRISE: 100000,
  }
  return planTokens[plan as keyof typeof planTokens] || 5000
}

// PUT /api/user/plan - Upgrade user plan
export async function PUT(request: NextRequest) {
  try {
    const userId = await getCurrentUser()
    if (!userId) {
      return NextResponse.json({ error: "No authenticated user ID found" }, { status: 401 })
    }

    const { newPlan } = await request.json()

    if (!newPlan || !["STARTER", "PRO", "ENTERPRISE"].includes(newPlan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
    }

    const newTokens = getPlanTokens(newPlan)

    await prisma.user.update({
      where: { id: userId },
      data: {
        plan: newPlan,
        tokens: newTokens, // Reset tokens for new plan
      },
    })

    await prisma.tokenUsage.create({
      data: {
        userId,
        operation: "plan_upgrade",
        tokens: -newTokens,
        description: `Upgraded to ${newPlan} plan`,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error upgrading plan:", error)
    return NextResponse.json({ error: "Failed to upgrade plan" }, { status: 500 })
  }
}
