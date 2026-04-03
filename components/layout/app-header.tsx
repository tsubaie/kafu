"use client";

import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import type { CreditBalance } from "@/lib/types";
import { Avatar } from "@/components/ui/avatar";

export function AppHeader() {
  const { data: session } = useSession();
  const [credits, setCredits] = useState<CreditBalance | null>(null);

  const refreshCredits = useCallback(() => {
    fetch("/api/me/credits")
      .then((res) => res.json())
      .then(setCredits)
      .catch(console.error);
  }, []);

  useEffect(() => {
    refreshCredits();
  }, [refreshCredits]);

  // Listen for credit updates from other components
  useEffect(() => {
    window.addEventListener("credits-updated", refreshCredits);
    return () => window.removeEventListener("credits-updated", refreshCredits);
  }, [refreshCredits]);

  if (!session?.user) return null;

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div />
      <div className="flex items-center gap-4">
        {credits && (
          <div className="flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1.5 text-sm font-medium text-primary-700">
            <img src="/icons/icons8-coins.svg" alt="" className="h-5 w-5" />
            <span>{credits.remaining}/{credits.total} رصيد</span>
          </div>
        )}
        <div className="flex items-center gap-3">
          <div className="text-start">
            <p className="text-sm font-medium text-gray-900">
              {session.user.name}
            </p>
            <p className="text-xs text-gray-500">{session.user.department}</p>
          </div>
          <Avatar name={session.user.name ?? ""} size="sm" />
        </div>
      </div>
    </header>
  );
}
