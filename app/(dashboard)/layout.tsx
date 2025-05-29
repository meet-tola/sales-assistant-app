import type React from "react";
import { QueryProvider } from "@/providers/query-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center justify-between border-b bg-white px-8">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold">
                  AI Assistant Dashboard
                </h1>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-auto bg-gray-50">
            <div className="p-8">
              <div className="bg-white rounded-lg p-8 min-h-[calc(100vh-8rem)]">
                {children}
              </div>
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </QueryProvider>
  );
}
