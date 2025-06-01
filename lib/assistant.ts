import prisma from "@/lib/prisma"

export async function getAssistant(assistantId: string) {
  return await prisma.assistant.findUnique({
    where: { id: assistantId },
  })
}
