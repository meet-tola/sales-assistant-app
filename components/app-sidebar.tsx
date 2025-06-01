"use client"

import { Bot, Plus, Settings, MessageSquare, Home, Eye, Crown, Sparkles } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { usePathname } from "next/navigation"

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Create Assistant",
    url: "/create",
    icon: Plus,
  },
  {
    title: "Manage Assistants",
    url: "/assistants",
    icon: Bot,
  },
  {
    title: "Responses",
    url: "/responses",
    icon: MessageSquare,
  },
  {
    title: "Preview & Test",
    url: "/preview",
    icon: Eye,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <Sidebar className="border-r border-border/40 bg-gradient-to-b from-background to-muted/20">
      <SidebarHeader className="border-b border-border/40 bg-background/50 backdrop-blur-sm">
        <div className="flex items-center gap-3 px-3 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Bot className="h-4 w-4" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold">AssistantAI</span>
              <span className="text-xs text-muted-foreground">AI Platform</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupContent className="mt-2">
            <SidebarMenu className="space-y-1">
              {items.map((item) => {
                const isActive = pathname === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={`
                        relative h-10 rounded-lg transition-all duration-200 hover:bg-accent/50
                        ${
                          isActive
                            ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                            : "hover:bg-accent hover:text-accent-foreground"
                        }
                      `}
                    >
                      <Link href={item.url} className="flex items-center gap-3 px-3">
                        <item.icon className={`h-4 w-4 ${isActive ? "text-primary" : ""}`} />
                        {!isCollapsed && <span className="font-medium">{item.title}</span>}
                        {isActive && !isCollapsed && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* <SidebarFooter className="p-2">
        {!isCollapsed && (
          <Card className="border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 dark:border-amber-800/30">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                  <Crown className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-amber-900 dark:text-amber-100">Upgrade to Pro</span>
                    <Badge
                      variant="secondary"
                      className="bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200"
                    >
                      <Sparkles className="mr-1 h-3 w-3" />
                      New
                    </Badge>
                  </div>
                  <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                    Unlock unlimited assistants, advanced analytics, and priority support.
                  </p>
                  <Button size="sm" className="w-full bg-amber-600 hover:bg-amber-700 text-white shadow-sm">
                    Upgrade Now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {isCollapsed && (
          <div className="flex justify-center">
            <Button
              size="icon"
              variant="outline"
              className="h-8 w-8 border-amber-200 bg-amber-50 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/20"
            >
              <Crown className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </Button>
          </div>
        )}

        <div className="mt-3 px-2 text-center">
          <p className="text-xs text-muted-foreground">© 2024 AssistantAI</p>
        </div>
      </SidebarFooter> */}
    </Sidebar>
  )
}
