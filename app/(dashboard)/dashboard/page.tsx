"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, MessageSquare, Plus, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useCreateUser, useUser } from "@/hooks/use-user";
import { useDashboardStats, useRecentActivity } from "@/hooks/use-dashboard";

export default function Dashboard() {
  const { mutate, isPending: creatingUser, error } = useCreateUser();
  const { data: user, isLoading: userLoading } = useUser();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: recentActivity, isLoading: activityLoading } =
    useRecentActivity();

  useEffect(() => {
    if (!user && !userLoading) {
      mutate();
    }
  }, [user, userLoading, mutate]);

  if (error) {
    console.error("User creation failed:", error);
  }

  if (userLoading || creatingUser || statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  return (
    <div className="container mx-auto px-1 py-2 sm:px-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's an overview of your AI assistants.
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Assistant
          </Link>
        </Button>
      </div>

      {/* Stats - Original Style */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-16">
          <div>
            <div className="text-3xl font-bold text-gray-900">
              {stats?.assistantCount || 0}
            </div>
            <p className="text-sm text-gray-600">Total Assistants</p>
            <p className="text-xs text-green-600 font-medium">
              Active and ready
            </p>
          </div>

          <div>
            <div className="text-3xl font-bold text-gray-900">
              {stats?.totalInteractions?.toLocaleString() || 0}
            </div>
            <p className="text-sm text-gray-600">Total Interactions</p>
            <p className="text-xs text-green-600 font-medium">All time</p>
          </div>

          <div>
            <div className="text-3xl font-bold text-gray-900">
              {stats?.tokens?.toLocaleString() || 0}
            </div>
            <p className="text-sm text-gray-600">Available Tokens</p>
            <p className="text-xs text-blue-600 font-medium">Ready to use</p>
          </div>
        </div>
      </div>

      {/* Main Content - Responsive Stack */}
      <div className="space-y-4 lg:space-y-0 lg:grid lg:gap-6 lg:grid-cols-5">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <div className="border rounded-lg p-4 sm:p-6">
            <div className="mb-3 sm:mb-4">
              <h3 className="text-lg sm:text-xl font-semibold">
                Quick Actions
              </h3>
              <p className="text-sm text-muted-foreground">
                Get started with common tasks
              </p>
            </div>
            <div className="space-y-2 sm:space-y-3">
              <Button
                variant="outline"
                className="w-full h-auto p-3 sm:p-4 justify-start text-sm"
                asChild
              >
                <Link href="/create">
                  <div className="flex items-center space-x-2 sm:space-x-3 w-full">
                    <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg flex-shrink-0">
                      <Plus className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="font-medium truncate">
                        Create New Assistant
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground truncate">
                        Build a new AI assistant
                      </div>
                    </div>
                    <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  </div>
                </Link>
              </Button>

              <Button
                variant="outline"
                className="w-full h-auto p-3 sm:p-4 justify-start text-sm"
                asChild
              >
                <Link href="/responses">
                  <div className="flex items-center space-x-2 sm:space-x-3 w-full">
                    <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg flex-shrink-0">
                      <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="font-medium truncate">View Responses</div>
                      <div className="text-xs sm:text-sm text-muted-foreground truncate">
                        Check user interactions
                      </div>
                    </div>
                    <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  </div>
                </Link>
              </Button>

              <Button
                variant="outline"
                className="w-full h-auto p-3 sm:p-4 justify-start text-sm"
                asChild
              >
                <Link href="/assistants">
                  <div className="flex items-center space-x-2 sm:space-x-3 w-full">
                    <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg flex-shrink-0">
                      <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="font-medium truncate">
                        Manage Assistants
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground truncate">
                        Edit and configure
                      </div>
                    </div>
                    <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  </div>
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-3">
          <div className="border rounded-lg p-4 sm:p-6">
            <div className="mb-3 sm:mb-4">
              <h3 className="text-lg sm:text-xl font-semibold">
                Recent Activity
              </h3>
              <p className="text-sm text-muted-foreground">
                Your most active assistants
              </p>
            </div>
            <div>
              {activityLoading ? (
                <div className="flex items-center justify-center py-6 sm:py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : recentActivity && recentActivity.length > 0 ? (
                <div className="space-y-2 sm:space-y-3">
                  {recentActivity.map((activity, index) => (
                    <div
                      key={activity.id}
                      className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="space-y-1 flex-1 min-w-0">
                        <p className="font-medium leading-none truncate">
                          {activity.name}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 truncate">
                          {activity.interactions} interactions •{" "}
                          {activity.lastActive}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                        <Badge
                          variant={
                            activity.type === "SALES"
                              ? "default"
                              : activity.type === "FEEDBACK"
                              ? "secondary"
                              : "outline"
                          }
                          className="text-xs"
                        >
                          {activity.type}
                        </Badge>
                        <Badge
                          variant={
                            activity.status === "ACTIVE"
                              ? "default"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {activity.status.toLowerCase()}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12">
                  <Bot className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-muted-foreground/50" />
                  <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">
                    No assistants yet. Create your first assistant to get
                    started!
                  </p>
                  <Button asChild size="sm">
                    <Link href="/create">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Assistant
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
