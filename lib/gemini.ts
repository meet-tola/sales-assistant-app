import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("Missing GEMINI_API_KEY environment variable");
}
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export async function generateAIResponse(
  instructions: string,
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }>,
  userMessage: string,
  assistantType: string,
  tone = "professional",
  responseLength = "medium",
) {
  const systemPrompt = `You are an AI assistant for ${assistantType.toLowerCase()} purposes. 

Instructions: ${instructions}

Tone: ${tone}
Response Length: ${responseLength === "short" ? "Keep responses brief and concise" : responseLength === "detailed" ? "Provide detailed and comprehensive responses" : "Provide moderate length responses"}

Always stay in character and follow the instructions provided. Be helpful, professional, and focused on the specific purpose of this assistant.`;

  const messages = [
    { role: "user" as const, content: systemPrompt },
    ...conversationHistory.map(msg => ({
      role: msg.role === "assistant" ? "model" : "user",
      content: msg.content
    })),
    { role: "user" as const, content: userMessage },
  ];

  const inputText = messages.map((m) => m.content).join(" ");
  const estimatedInputTokens = estimateTokens(inputText);

  try {
    const chat = model.startChat({
      history: messages as any,
    });

    const result = await chat.sendMessage(userMessage);
    const response = result.response.text();

    const actualTokens = estimatedInputTokens + estimateTokens(response);

    return {
      response,
      tokensUsed: actualTokens,
    };
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to generate AI response");
  }
}

export function calculateInstructionTokens(instructions: string, welcomeMessage: string): number {
  const totalText = instructions + welcomeMessage;
  return estimateTokens(totalText);
}