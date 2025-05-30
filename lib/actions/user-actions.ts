"use server"

import prisma from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { currentUser } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"

export async function createUser() {
  try {
    const userId = await getCurrentUser()
    const clerkUser = await currentUser()

    if (!clerkUser || !userId) {
      throw new Error("No authenticated user found")
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (existingUser) {
      return existingUser
    }

    const email = clerkUser.emailAddresses[0]?.emailAddress || ""
    const name =
      clerkUser.firstName && clerkUser.lastName
        ? `${clerkUser.firstName} ${clerkUser.lastName}`.trim()
        : clerkUser.firstName || clerkUser.username || "User"

    const newUser = await prisma.user.create({
      data: {
        id: userId,
        email,
        name,
        image: clerkUser.imageUrl || null,
        tokens: 5000,
        plan: "STARTER",
      },
    })

    await prisma.tokenUsage.create({
      data: {
        userId,
        operation: "welcome_bonus",
        tokens: -5000,
        description: "Welcome bonus for new user - 5000 tokens to get started!",
      },
    })

    console.log(`New user created: ${name} (${email}) with 5000 welcome tokens`)
    return newUser
  } catch (error) {
    console.error("Error creating user:", error)
    return null
  }
}

export async function getUser() {
  try {
    const userId = await getCurrentUser()
    if (!userId) throw new Error("No authenticated user ID found")

    const user = await prisma.user.findUnique({
      where: { id: userId },
    })
    return user
  } catch (error) {
    console.error("Error fetching user:", error)
    return null
  }
}

export async function getUserTokens() {
  try {
    const userId = await getCurrentUser()

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { tokens: true, plan: true },
    })

    return user
  } catch (error) {
    console.error("Error fetching user tokens:", error)
    return null
  }
}

export async function deductTokens(tokens: number, operation: string, assistantId?: string, description?: string) {
  try {
    const userId = await getCurrentUser()

    // Check if user has enough tokens
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { tokens: true },
    })

    if (!user || user.tokens < tokens) {
      return { success: false, error: "Insufficient tokens" }
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

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error deducting tokens:", error)
    return { success: false, error: "Failed to deduct tokens" }
  }
}

export async function addTokens(tokens: number, reason: string) {
  try {
    const userId = await getCurrentUser()

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

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error adding tokens:", error)
    return { success: false, error: "Failed to add tokens" }
  }
}

export async function getUserUsage() {
  try {
    const userId = await getCurrentUser()

    const [user, assistantCount, totalInteractions, tokenUsage] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
      }),
      prisma.assistant.count({
        where: { userId },
      }),
      prisma.assistant.aggregate({
        where: { userId },
        _sum: { interactions: true },
      }),
      prisma.tokenUsage.aggregate({
        where: {
          userId,
          tokens: { gt: 0 }, // Only count token usage, not credits
        },
        _sum: { tokens: true },
      }),
    ])

    const planLimits = {
      STARTER: { assistants: 5, interactions: 1000, teamMembers: 1, monthlyTokens: 5000 },
      PRO: { assistants: 25, interactions: 10000, teamMembers: 10, monthlyTokens: 25000 },
      ENTERPRISE: { assistants: -1, interactions: -1, teamMembers: -1, monthlyTokens: 100000 }, // unlimited
    }

    const currentPlan = user?.plan || "PRO"
    const limits = planLimits[currentPlan as keyof typeof planLimits]

    return {
      assistants: {
        current: assistantCount,
        limit: limits.assistants,
        percentage: limits.assistants === -1 ? 0 : Math.round((assistantCount / limits.assistants) * 100),
      },
      interactions: {
        current: totalInteractions._sum.interactions || 0,
        limit: limits.interactions,
        percentage:
          limits.interactions === -1
            ? 0
            : Math.round(((totalInteractions._sum.interactions || 0) / limits.interactions) * 100),
      },
      teamMembers: {
        current: 1, // Single user for now
        limit: limits.teamMembers,
        percentage: limits.teamMembers === -1 ? 0 : Math.round((1 / limits.teamMembers) * 100),
      },
      tokens: {
        current: user?.tokens || 0,
        used: tokenUsage._sum.tokens || 0,
        limit: limits.monthlyTokens,
      },
      plan: currentPlan,
    }
  } catch (error) {
    console.error("Error fetching user usage:", error)
    return null
  }
}

export async function upgradePlan(newPlan: "STARTER" | "PRO" | "ENTERPRISE") {
  try {
    const userId = await getCurrentUser()

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

    revalidatePath("/settings")
    return { success: true }
  } catch (error) {
    console.error("Error upgrading plan:", error)
    return { success: false, error: "Failed to upgrade plan" }
  }
}

function getPlanTokens(plan: string): number {
  const planTokens = {
    STARTER: 5000,
    PRO: 25000,
    ENTERPRISE: 100000,
  }
  return planTokens[plan as keyof typeof planTokens] || 5000
}

export async function getTokenUsageHistory() {
  try {
    const userId = await getCurrentUser()

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

    return usage
  } catch (error) {
    console.error("Error fetching token usage history:", error)
    return []
  }
}
