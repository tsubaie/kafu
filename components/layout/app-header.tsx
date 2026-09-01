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

  useEffect(() => {
    window.addEventListener("credits-updated", refreshCredits);
    return () => window.removeEventListener("credits-updated", refreshCredits);
  }, [refreshCredits]);

  if (!session?.user) return null;

  const now = new Date();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const daysLeft = Math.ceil((endOfMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <header className="flex h-16 items-center justify-between bg-white/80 backdrop-blur-sm px-8 border-b border-gray-100">
      <div />
      <div className="flex items-center gap-5">
        {credits && (
          <div className="flex items-center gap-2 rounded-2xl bg-gradient-to-l from-primary-50 to-primary-100/60 px-4 py-2 shadow-sm">
            <img src="/icons/icons8-coins.svg" alt="" className="h-5 w-5" />
            <span className="text-sm font-bold text-primary-700 tabular-nums">
              {credits.remaining}/{credits.total}
            </span>
            <span className="text-xs text-primary-500 font-medium">كفو متبقي</span>
            <span className="text-xs text-gray-400 font-medium">· {daysLeft} يوم</span>
          </div>
        )}
        <div className="flex items-center gap-3 rounded-2xl hover:bg-gray-50 px-3 py-1.5 transition-colors cursor-default">
          <div className="text-start">
            <p className="text-sm font-bold text-gray-900">
              {session.user.name}
            </p>
            <p className="text-xs text-gray-400">{session.user.department}</p>
          </div>
          <Avatar name={session.user.name ?? ""} size="sm" />
        </div>
      </div>
    </header>
  );
}
