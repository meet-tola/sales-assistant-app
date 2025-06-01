"use client";

import { useUserTokens } from "@/hooks/use-user";
import { UserButton } from "@clerk/nextjs";
import { Coins, Loader2 } from "lucide-react";

export function UserTokenDisplay() {
  const { data: userTokens, isLoading } = useUserTokens();

  return (
    <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-1.5">
        <Coins className="h-4 w-4 text-amber-500" />{" "}
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <span className="text-sm font-medium">
            {userTokens?.tokens?.toLocaleString() || 0} tokens
          </span>
        )}
      </div>
      <UserButton afterSignOutUrl="/" />
    </div>
  );
}
