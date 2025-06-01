import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

function getRelativeTime(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return "Just now"
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  return `${Math.floor(diffInSeconds / 86400)} days ago`
}

// GET /api/user/dashboard/activity - Get user recent activity
export async function GET() {
  try {
    const userId = await getCurrentUser()

    const assistants = await prisma.assistant.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: 4,
      select: {
        id: true,
        name: true,
        type: true,
        status: true,
        interactions: true,
        updatedAt: true,
      },
    })

    const activity = assistants.map((assistant) => ({
      ...assistant,
      lastActive: getRelativeTime(assistant.updatedAt),
    }))

    return NextResponse.json(activity)
  } catch (error) {
    console.error("Error fetching recent activity:", error)
    return NextResponse.json([], { status: 500 })
  }
}
