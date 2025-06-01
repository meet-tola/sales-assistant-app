"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  MoreHorizontal,
  Search,
  Plus,
  Copy,
  Trash2,
  Eye,
  Globe,
  Code,
  Play,
  Pause,
  ExternalLink,
  Check,
  Loader2,
  Bot,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import {
  useAssistants,
  useDeleteAssistant,
  useDuplicateAssistant,
  useUpdateAssistantStatus,
} from "@/hooks/use-assistants"

export default function ManageAssistants() {
  const [searchTerm, setSearchTerm] = useState("")
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const { data: assistants, isLoading } = useAssistants()
  const deleteAssistant = useDeleteAssistant()
  const duplicateAssistant = useDuplicateAssistant()
  const updateStatus = useUpdateAssistantStatus()

  const filteredAssistants =
    assistants?.filter(
      (assistant) =>
        assistant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assistant.type.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || []

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "default"
      case "PAUSED":
        return "secondary"
      case "DRAFT":
        return "outline"
      default:
        return "secondary"
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

  const getEmbedCode = (assistant: any) => {
    return `<script>
  (function() {
    var script = document.createElement('script');
    script.src = '${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/widget/${assistant.id}';
    document.head.appendChild(script);
  })();
</script>`
  }

  const getShareableLink = (assistant: any) => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

    // Use survey route for survey assistants, chat route for others
    if (assistant.type === "SURVEY") {
      return `${baseUrl}/survey/${assistant.id}`
    } else {
      return `${baseUrl}/chat/${assistant.id}`
    }
  }

  const copyToClipboard = async (text: string, assistantId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(assistantId)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error("Failed to copy: ", err)
    }
  }

  const handleStatusToggle = (assistant: any) => {
    const newStatus = assistant.status === "ACTIVE" ? "PAUSED" : "ACTIVE"
    updateStatus.mutate({ id: assistant.id, status: newStatus })
  }

  const handleDelete = (assistantId: string) => {
    if (confirm("Are you sure you want to delete this assistant? This action cannot be undone.")) {
      deleteAssistant.mutate(assistantId)
    }
  }

  const handleDuplicate = (assistantId: string) => {
    duplicateAssistant.mutate(assistantId)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">Manage Assistants</h1>
          <p className="text-lg text-gray-600 mt-2">View and manage all your AI assistants</p>
        </div>
        <Button
          asChild
          size="lg"
        >
          <Link href="/create">
            <Plus className="mr-2 h-5 w-5" />
            Create Assistant
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assistants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assistants?.length || 0}</div>
            <p className="text-xs text-gray-600">
              {assistants?.filter((a) => a.status === "ACTIVE").length || 0} active
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Interactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {assistants?.reduce((sum, a) => sum + a.interactions, 0).toLocaleString() || 0}
            </div>
            <p className="text-xs text-gray-600">Across all assistants</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Assistants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assistants?.filter((a) => a.status === "ACTIVE").length || 0}</div>
            <p className="text-xs text-gray-600">Currently running</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tokens Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {assistants?.reduce((sum, a) => sum + (a.tokensUsed || 0), 0).toLocaleString() || 0}
            </div>
            <p className="text-xs text-gray-600">Total consumed</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="border-0 shadow-sm">
        <CardContent className="pt-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search assistants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
        </CardContent>
      </Card>

      {/* Assistants Grid */}
      {filteredAssistants.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Bot className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No assistants found</h3>
            <p className="text-gray-600 text-center mb-6">
              {searchTerm ? "Try adjusting your search terms" : "Create your first AI assistant to get started"}
            </p>
            {!searchTerm && (
              <Button asChild>
                <Link href="/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Assistant
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredAssistants.map((assistant) => (
            <Card key={assistant.id} className="border-0 shadow-sm hover:shadow-md transition-all duration-200">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-xl">{assistant.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant={getTypeColor(assistant.type)}>{assistant.type}</Badge>
                      <Badge variant={getStatusColor(assistant.status)}>{assistant.status.toLowerCase()}</Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/preview?assistant=${assistant.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Preview
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(assistant.id)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusToggle(assistant)}>
                        {assistant.status === "ACTIVE" ? (
                          <>
                            <Pause className="mr-2 h-4 w-4" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="mr-2 h-4 w-4" />
                            Activate
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(assistant.id)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardDescription className="text-sm line-clamp-2">
                  {assistant.instructions.length > 100
                    ? `${assistant.instructions.substring(0, 100)}...`
                    : assistant.instructions}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Interactions</p>
                    <p className="font-medium">{assistant.interactions.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Tokens Used</p>
                    <p className="font-medium">{(assistant.tokensUsed || 0).toLocaleString()}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {assistant.deliveryMethod === "WIDGET" ? (
                      <Code className="h-4 w-4 text-gray-600" />
                    ) : (
                      <Globe className="h-4 w-4 text-gray-600" />
                    )}
                    <span className="text-sm font-medium capitalize">{assistant.deliveryMethod.toLowerCase()}</span>
                  </div>

                  {assistant.deliveryMethod === "WIDGET" ? (
                    <div className="space-y-2">
                      <p className="text-xs text-gray-600">Embed Code</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => copyToClipboard(getEmbedCode(assistant), assistant.id)}
                      >
                        {copiedId === assistant.id ? (
                          <Check className="mr-2 h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="mr-2 h-4 w-4" />
                        )}
                        {copiedId === assistant.id ? "Copied!" : "Copy Embed Code"}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-xs text-gray-600">Shareable Link</p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => copyToClipboard(getShareableLink(assistant), assistant.id)}
                        >
                          {copiedId === assistant.id ? (
                            <Check className="mr-2 h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="mr-2 h-4 w-4" />
                          )}
                          {copiedId === assistant.id ? "Copied!" : "Copy Link"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(getShareableLink(assistant), "_blank")}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
