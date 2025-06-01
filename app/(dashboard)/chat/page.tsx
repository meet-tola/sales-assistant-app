"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Send, Bot, User, Loader2, MessageSquare } from "lucide-react"
import { useParams } from "next/navigation"

interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: Date
  tokens?: number
}

interface AssistantInfo {
  id: string
  name: string
  type: string
  welcomeMessage: string
  status: string
}

export default function ChatPage() {
  const params = useParams()
  const assistantId = params.assistantId as string

  const [assistant, setAssistant] = useState<AssistantInfo | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    initializeChat()
  }, [assistantId])

  const initializeChat = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Get assistant info
      const assistantResponse = await fetch(`/api/chat/${assistantId}`)
      if (!assistantResponse.ok) {
        throw new Error("Assistant not found or inactive")
      }

      const assistantData = await assistantResponse.json()
      setAssistant(assistantData)

      // Start conversation
      const chatResponse = await fetch(`/api/chat/${assistantId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail: "anonymous@chat.com" }),
      })

      if (!chatResponse.ok) {
        throw new Error("Failed to start conversation")
      }

      const chatData = await chatResponse.json()
      setConversationId(chatData.conversationId)

      if (chatData.messages) {
        setMessages(
          chatData.messages.map((msg: any) => ({
            role: msg.role,
            content: msg.content,
            timestamp: new Date(msg.timestamp),
            tokens: msg.tokens,
          })),
        )
      }
    } catch (error) {
      console.error("Failed to initialize chat:", error)
      setError(error instanceof Error ? error.message : "Failed to load assistant")
    } finally {
      setIsLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || isSending || !conversationId) return

    const userMessage: Message = {
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsSending(true)

    try {
      const response = await fetch(`/api/chat/${assistantId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: inputMessage,
          conversationId,
          userEmail: "anonymous@chat.com",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      const lastMessage = data.messages[data.messages.length - 1]
      if (lastMessage && lastMessage.role === "assistant") {
        const assistantMessage: Message = {
          role: "assistant",
          content: lastMessage.content,
          timestamp: new Date(lastMessage.timestamp),
          tokens: lastMessage.tokens,
        }
        setMessages((prev) => [...prev, assistantMessage])
      }
    } catch (error) {
      console.error("Failed to send message:", error)
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, I'm having trouble responding right now. Please try again.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "SALES":
        return "bg-blue-100 text-blue-800"
      case "FEEDBACK":
        return "bg-green-100 text-green-800"
      case "SURVEY":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading assistant...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Assistant Unavailable</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={initializeChat}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{assistant?.name}</h1>
                <div className="flex items-center gap-2">
                  <Badge className={getTypeColor(assistant?.type || "")}>{assistant?.type}</Badge>
                  <span className="text-sm text-gray-500">AI Assistant</span>
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-500">Powered by AssistantAI</div>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Card className="h-[calc(100vh-200px)] flex flex-col">
          {/* Messages */}
          <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-3 ${
                    message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs opacity-70 mb-1">
                    {message.role === "user" ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
                    <span>{message.role === "user" ? "You" : assistant?.name}</span>
                    {message.tokens && message.tokens > 0 && <span className="ml-auto">({message.tokens} tokens)</span>}
                  </div>
                  <div className="whitespace-pre-wrap">{message.content}</div>
                </div>
              </div>
            ))}

            {isSending && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg px-4 py-3 bg-muted">
                  <div className="flex items-center gap-2 text-xs opacity-70 mb-1">
                    <Bot className="h-3 w-3" />
                    <span>{assistant?.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-current rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-current rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </CardContent>

          {/* Input */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Message ${assistant?.name}...`}
                disabled={isSending}
                className="flex-1"
              />
              <Button onClick={sendMessage} disabled={!inputMessage.trim() || isSending} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              This conversation is powered by AI and may not always be accurate.
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
