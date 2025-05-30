import type React from "react";
import { QueryProvider } from "@/providers/query-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import Navbar from "@/components/navbar";

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
            <Navbar />
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
