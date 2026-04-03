"use client";

import { useEffect, useState } from "react";
import { LeaderboardRow } from "@/components/ui/leaderboard-row";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import type { LeaderboardEntry } from "@/lib/types";

type Period = "month" | "all-time";

const podiumConfig: Record<number, {
  heightPx: number;
  frontGradient: string;
  topColor: string;
  sideColor: string;
  ring: string;
  ribbon: string;
  delay: string;
}> = {
  1: {
    heightPx: 160,
    frontGradient: "linear-gradient(to bottom, #fbbf24, #f59e0b, #d97706)",
    topColor: "#fcd34d",
    sideColor: "#b45309",
    ring: "ring-amber-300 ring-offset-2",
    ribbon: "/icons/icons8-first-place-ribbon.svg",
    delay: "200ms",
  },
  2: {
    heightPx: 110,
    frontGradient: "linear-gradient(to bottom, #d1d5db, #9ca3af, #6b7280)",
    topColor: "#e5e7eb",
    sideColor: "#4b5563",
    ring: "ring-gray-300 ring-offset-2",
    ribbon: "/icons/icons8-second-place-ribbon.svg",
    delay: "350ms",
  },
  3: {
    heightPx: 85,
    frontGradient: "linear-gradient(to bottom, #fdba74, #f97316, #c2410c)",
    topColor: "#fed7aa",
    sideColor: "#9a3412",
    ring: "ring-orange-300 ring-offset-2",
    ribbon: "/icons/icons8-third-place-ribbon.svg",
    delay: "500ms",
  },
};

const DEPTH = 20; // px — how "thick" the 3D block looks

function PodiumBlock({ entry, rank }: { entry: LeaderboardEntry; rank: number }) {
  const config = podiumConfig[rank];

  return (
    <div
      className="flex flex-col items-center flex-1 max-w-[200px]"
      style={{ animation: `fadeIn 0.5s ease-out ${config.delay} backwards` }}
    >
      {/* Ribbon + Name floating above */}
      <div className="mb-4 flex flex-col items-center">
        <img
          src={config.ribbon}
          alt=""
          className="h-14 w-14 drop-shadow-lg mb-2"
        />
        <p className="text-base font-bold text-gray-900 text-center truncate max-w-full">
          {entry.name}
        </p>
        <p className="text-xs text-gray-400 font-medium">{entry.department}</p>
      </div>

      {/* 3D Block */}
      <div className="relative w-full">
        {/* Top face */}
        <div
          style={{
            height: DEPTH,
            background: config.topColor,
            borderRadius: "12px 12px 0 0",
            transform: `perspective(300px) rotateX(45deg)`,
            transformOrigin: "bottom center",
          }}
        />

        {/* Front face */}
        <div
          className="relative w-full flex flex-col items-center justify-center"
          style={{
            height: config.heightPx,
            background: config.frontGradient,
            borderRadius: "0 0 12px 12px",
            boxShadow: "0 12px 32px -8px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.2)",
          }}
        >
          <span className="text-4xl font-bold text-white tabular-nums"
          style={{ textShadow: "0 2px 8px rgba(0,0,0,0.2)" }}
          >
            {entry.total_credits}
          </span>
          <span className="text-white/70 text-sm font-bold mt-1">كفو</span>
        </div>
      </div>
    </div>
  );
}

function Podium({ entries }: { entries: LeaderboardEntry[] }) {
  // RTL: DOM order [#3, #1, #2] renders visually as #2 | #1 | #3
  const ordered = [
    entries[2] ? { entry: entries[2], rank: 3 } : null,
    entries[0] ? { entry: entries[0], rank: 1 } : null,
    entries[1] ? { entry: entries[1], rank: 2 } : null,
  ].filter(Boolean) as { entry: LeaderboardEntry; rank: number }[];

  return (
    <div className="flex items-end justify-center gap-4 mb-12 px-4 pt-4">
      {ordered.map(({ entry, rank }) => (
        <PodiumBlock key={entry.user_id} entry={entry} rank={rank} />
      ))}
    </div>
  );
}

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

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <div className="mx-auto max-w-2xl animate-[fadeIn_0.3s_ease-out]">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <img src="/icons/icons8-trophy.svg" alt="" className="h-10 w-10" />
          <h1 className="text-2xl font-bold text-gray-900">المتصدرون</h1>
        </div>
        <div className="flex rounded-2xl bg-white p-1 ring-1 ring-gray-200 shadow-sm">
          {(["month", "all-time"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                "rounded-xl px-5 py-2.5 text-sm font-bold transition-all duration-200",
                period === p
                  ? "bg-gradient-to-l from-primary-600 to-primary-500 text-white shadow-md"
                  : "text-gray-400 hover:text-gray-600"
              )}
            >
              {p === "month" ? "هذا الشهر" : "الكل"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
        </div>
      ) : entries.length === 0 ? (
        <EmptyState
          iconSrc="/icons/icons8-trophy.svg"
          title={period === "month" ? "ما أحد تكفوو هالشهر 🤔" : "ما أحد تكفوو بعد"}
          description={
            period === "month"
              ? "كن أول واحد يرسل كفو!"
              : "أرسل أول كفو وابدأ المنافسة!"
          }
        />
      ) : (
        <>
          {top3.length > 0 && <Podium entries={top3} />}

          {rest.length > 0 && (
            <div className="space-y-3">
              {rest.map((entry, i) => (
                <LeaderboardRow
                  key={entry.user_id}
                  entry={entry}
                  rank={i + 4}
                  style={{
                    animationDelay: `${600 + i * 70}ms`,
                    animation: "fadeIn 0.4s ease-out backwards",
                  }}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* ── How ranking works ── */}
      {entries.length > 0 && (
        <p className="text-xs text-gray-400 text-center mt-10 leading-relaxed">
          الترتيب حسب عدد الكفووات المستلمة، وإذا تساووا يتقدّم اللي استلم كفووات أكثر، ثم اللي استلم أول.
        </p>
      )}
    </div>
  );
}
