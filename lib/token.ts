// lib/token.ts
import  prisma from "@/lib/prisma" 
import { TokenUsage } from "@prisma/client"

export async function deductTokens({
  userId,
  tokens,
  operation,
  assistantId,
  description,
}: {
  userId: string
  tokens: number
  operation: string
  assistantId?: string
  description?: string
}): Promise<{ success: true } | { error: string }> {
  if (!tokens || !operation) {
    return { error: "Missing required fields" }
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { tokens: true },
  })

  if (!user || user.tokens < tokens) {
    return { error: "Insufficient tokens" }
  }

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

  return { success: true }
}
