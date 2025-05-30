import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { currentUser } from "@clerk/nextjs/server"

// GET /api/user - Get current user
export async function GET() {
  try {
    const userId = await getCurrentUser()
    if (!userId) {
      return NextResponse.json({ error: "No authenticated user ID found" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
  }
}

// POST /api/user - Create new user
export async function POST() {
  try {
    const userId = await getCurrentUser()
    const clerkUser = await currentUser()

    if (!clerkUser || !userId) {
      return NextResponse.json({ error: "No authenticated user found" }, { status: 401 })
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (existingUser) {
      return NextResponse.json(existingUser)
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
    return NextResponse.json(newUser, { status: 201 })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}
