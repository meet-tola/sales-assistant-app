"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Search, Download, Eye, Filter, MessageSquare, Calendar, User, Loader2, Bot } from "lucide-react"
import { useConversations, useResponsesStats } from "@/hooks/use-responses"
import { useAssistants } from "@/hooks/use-assistants"

export default function ResponsesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAssistant, setSelectedAssistant] = useState("all")
  const [selectedResponse, setSelectedResponse] = useState<any>(null)

  const { data: conversations, isLoading: conversationsLoading } = useConversations()
  const { data: stats, isLoading: statsLoading } = useResponsesStats()
  const { data: assistants } = useAssistants()

  const assistantOptions = ["all", ...(assistants?.map((a) => a.name) || [])]

  const filteredResponses =
    conversations?.filter((response) => {
      const matchesSearch =
        response.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        response.summary.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesAssistant = selectedAssistant === "all" || response.assistant === selectedAssistant
      return matchesSearch && matchesAssistant
    }) || []

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "default"
      case "incomplete":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "SALES":
        return "default"
      case "FEEDBACK":
        return "secondary"
      case "SURVEY":
        return "outline"
      default:
        return "secondary"
    }
  }

  const exportResponses = () => {
    const csvContent = [
      ["ID", "Assistant", "User", "Timestamp", "Type", "Status", "Messages", "Tokens Used", "Summary"],
      ...filteredResponses.map((r) => [
        r.id,
        r.assistant,
        r.user,
        r.timestamp,
        r.type,
        r.status,
        r.messages,
        r.tokensUsed || 0,
        r.summary,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "assistant-responses.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (conversationsLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Responses
          </h1>
          <p className="text-lg text-muted-foreground mt-2">View and analyze user interactions with your assistants</p>
        </div>
        <Button onClick={exportResponses} size="lg" disabled={filteredResponses.length === 0}>
          <Download className="mr-2 h-5 w-5" />
          Export CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card variant="outline" className="border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalResponses || 0}</div>
            <p className="text-xs text-muted-foreground">All conversations</p>
          </CardContent>
        </Card>
        <Card variant="outline" className="border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.completionRate || 0}%</div>
            <p className="text-xs text-muted-foreground">Of all interactions</p>
          </CardContent>
        </Card>
        <Card variant="outline" className="border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.avgMessages || 0}</div>
            <p className="text-xs text-muted-foreground">Per conversation</p>
          </CardContent>
        </Card>
        <Card variant="outline" className="border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tokens Used</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalTokensUsed?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">Total consumed</p>
          </CardContent>
        </Card>
      </div>

      {/* Responses Table */}
      <Card variant="outline" className="border-2">
        <CardHeader>
          <CardTitle className="text-xl">User Responses</CardTitle>
          <CardDescription className="text-base">
            Detailed view of all user interactions with your assistants
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search responses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            <Select value={selectedAssistant} onValueChange={setSelectedAssistant}>
              <SelectTrigger className="w-[200px] h-12">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by assistant" />
              </SelectTrigger>
              <SelectContent>
                {assistantOptions.map((assistant) => (
                  <SelectItem key={assistant} value={assistant}>
                    {assistant === "all" ? "All Assistants" : assistant}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {filteredResponses.length === 0 ? (
            <div className="text-center py-16">
              <Bot className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No responses found</h3>
              <p className="text-gray-600">
                {searchTerm || selectedAssistant !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Responses will appear here once users interact with your assistants"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Assistant</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Messages</TableHead>
                  <TableHead>Tokens</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Summary</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResponses.map((response) => (
                  <TableRow key={response.id}>
                    <TableCell className="font-medium">{response.user}</TableCell>
                    <TableCell>{response.assistant}</TableCell>
                    <TableCell>
                      <Badge variant={getTypeColor(response.type)}>{response.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(response.status)}>{response.status}</Badge>
                    </TableCell>
                    <TableCell>{response.messages}</TableCell>
                    <TableCell>{(response.tokensUsed || 0).toLocaleString()}</TableCell>
                    <TableCell>{response.timestamp}</TableCell>
                    <TableCell className="max-w-xs truncate">{response.summary}</TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedResponse(response)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Conversation Details</DialogTitle>
                            <DialogDescription>
                              Full conversation between {response.user} and {response.assistant}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <strong>User:</strong> {response.user}
                              </div>
                              <div>
                                <strong>Assistant:</strong> {response.assistant}
                              </div>
                              <div>
                                <strong>Timestamp:</strong> {response.timestamp}
                              </div>
                              <div>
                                <strong>Status:</strong>
                                <Badge variant={getStatusColor(response.status)} className="ml-2">
                                  {response.status}
                                </Badge>
                              </div>
                              <div>
                                <strong>Messages:</strong> {response.messages}
                              </div>
                              <div>
                                <strong>Tokens Used:</strong> {(response.tokensUsed || 0).toLocaleString()}
                              </div>
                            </div>
                            <div className="border rounded-lg p-4 space-y-3 max-h-96 overflow-y-auto">
                              {response.fullConversation.map((message: any, index: number) => (
                                <div
                                  key={index}
                                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                  <div
                                    className={`max-w-[80%] p-3 rounded-lg ${
                                      message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                                    }`}
                                  >
                                    <div className="text-xs opacity-70 mb-1 flex items-center justify-between">
                                      <span>{message.role === "user" ? "User" : "Assistant"}</span>
                                      {message.tokens > 0 && (
                                        <span className="text-xs opacity-50">{message.tokens} tokens</span>
                                      )}
                                    </div>
                                    {message.content}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
