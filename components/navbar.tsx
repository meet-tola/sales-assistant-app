import { SidebarTrigger } from "./ui/sidebar";
import { Bot, Coins, User, Settings, LogOut, CreditCard } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import { UserButton } from "@clerk/nextjs";
import { UserTokenDisplay } from "./use-token-display";

const tokenCount = 2500;
const tokenLimit = 10000;

export default function Navbar() {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
      {/* Left side - Sidebar trigger, logo, and breadcrumb */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-4" />
        </div>

        {/* Logo */}
        <div className="flex items-center gap-2 md:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Bot className="h-4 w-4" />
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="text-sm font-semibold">AssistantAI</span>
            <span className="text-xs text-muted-foreground">Platform</span>
          </div>
        </div>

        {/* <Separator orientation="vertical" className="hidden md:block h-4" /> */}

        {/* Breadcrumb */}
        <Breadcrumb className="hidden md:block">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Overview</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Right side - Token count and user profile */}
      <UserTokenDisplay />
    </header>
  );
}
