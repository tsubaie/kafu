"use client";

import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import { LeaderboardRow } from "@/components/ui/leaderboard-row";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import type { LeaderboardEntry } from "@/lib/types";

type Period = "month" | "all-time";

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [period, setPeriod] = useState<Period>("month");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/leaderboard?period=${period}`)
      .then((r) => r.json())
      .then(setEntries)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [period]);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Leaderboard</h1>
        <div className="flex rounded-lg border border-gray-200 bg-white p-0.5">
          {(["month", "all-time"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                period === p
                  ? "bg-primary-50 text-primary-700"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              {p === "month" ? "This Month" : "All Time"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
        </div>
      ) : entries.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="No recognitions yet"
          description={
            period === "month"
              ? "No one has been recognized this month yet. Be the first!"
              : "No recognitions have been sent yet."
          }
        />
      ) : (
        <div className="space-y-2">
          {entries.map((entry, i) => (
            <LeaderboardRow key={entry.user_id} entry={entry} rank={i + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
