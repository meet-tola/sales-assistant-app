import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

export async function getCurrentUser() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  return userId
}

export async function getCurrentUserOptional() {
  const { userId } = await auth()
  return userId
}
