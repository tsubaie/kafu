"use client";

import { useEffect, useState } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

const badgeConfig: Record<string, {
  emoji: string;
  gradient: string;
  shadow: string;
}> = {
  "شقردي": {
    emoji: "⚡",
    gradient: "from-amber-400 via-orange-500 to-amber-600",
    shadow: "shadow-amber-500/20",
  },
  "هب ريح": {
    emoji: "🔥",
    gradient: "from-rose-400 via-red-500 to-rose-600",
    shadow: "shadow-red-500/20",
  },
  "فزعة": {
    emoji: "🤝",
    gradient: "from-sky-400 via-blue-500 to-sky-600",
    shadow: "shadow-sky-500/20",
  },
  "متعاون": {
    emoji: "💪",
    gradient: "from-emerald-400 via-teal-500 to-emerald-600",
    shadow: "shadow-emerald-500/20",
  },
  "فنّان": {
    emoji: "🎨",
    gradient: "from-violet-400 via-purple-500 to-violet-600",
    shadow: "shadow-violet-500/20",
  },
};

const defaultBadge = {
  emoji: "⭐",
  gradient: "from-primary-400 via-primary-500 to-primary-600",
  shadow: "shadow-primary-500/20",
};

interface ReceivedRecognition {
  id: string;
  credits: number;
  badge: string | null;
  message: string;
  created_at: string;
  sender_name: string;
  sender_department: string;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "الآن";
  if (minutes < 60) return `منذ ${minutes} د`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `منذ ${hours} س`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `منذ ${days} ي`;
  return new Date(dateStr).toLocaleDateString("ar-SA");
}

export default function InboxPage() {
  const [recognitions, setRecognitions] = useState<ReceivedRecognition[]>([]);
  const [total, setTotal] = useState(0);
  const [totalCredits, setTotalCredits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  function loadRecognitions(offset: number) {
    return fetch(`/api/me/recognitions?offset=${offset}`)
      .then((r) => r.json())
      .then((data: { items: ReceivedRecognition[]; total: number; totalCredits: number }) => {
        if (offset === 0) {
          setRecognitions(data.items);
        } else {
          setRecognitions((prev) => [...prev, ...data.items]);
        }
        setTotal(data.total);
        setTotalCredits(data.totalCredits);
      });
  }

  useEffect(() => {
    loadRecognitions(0)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const hasMore = recognitions.length < total;

  function handleLoadMore() {
    setLoadingMore(true);
    loadRecognitions(recognitions.length)
      .catch(console.error)
      .finally(() => setLoadingMore(false));
  }

  const totalReceived = totalCredits;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl animate-[fadeIn_0.3s_ease-out]">
      {/* ── Hero Banner ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-bl from-primary-500 via-primary-600 to-primary-700 p-8 mb-12">
        <div className="absolute -top-6 -left-6 h-24 w-24 rounded-full bg-white/10" />
        <div className="absolute -bottom-4 -right-4 h-16 w-16 rounded-full bg-white/5" />
        <div className="absolute top-4 right-6 h-8 w-8 rounded-full bg-white/10" />

        <div className="relative flex items-center gap-5">
          <img src="/icons/icons8-star.svg" alt="" className="h-16 w-16 drop-shadow-lg" />
          <div>
            <p className="text-sm font-medium text-primary-100 mb-1">مجموع الكفووات</p>
            <p className="text-3xl font-bold text-white leading-tight">
              عندك <span className="text-4xl tabular-nums">{totalReceived}</span> كفوووو ✨
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 mb-8" />

      {/* ── Recognition Cards ── */}
      {recognitions.length === 0 ? (
        <EmptyState
          iconSrc="/icons/icons8-high-five.svg"
          title="أول كفو في الطريق! 🎉"
          description="ابدأ بإرسال كفو لزملاءك."
        />
      ) : (
        <div className="space-y-5">
          {recognitions.map((r, i) => {
            const badge = r.badge ? (badgeConfig[r.badge] ?? defaultBadge) : defaultBadge;
            return (
              <div
                key={r.id}
                className={cn(
                  "group overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-[1.01]",
                  badge.shadow
                )}
                style={{ animationDelay: `${i * 80}ms`, animation: "fadeIn 0.4s ease-out backwards" }}
              >
                {/* ── Colored banner ── */}
                <div className={cn(
                  "relative bg-gradient-to-l px-6 py-5",
                  badge.gradient
                )}>
                  {/* Decorative circles */}
                  <div className="absolute -top-4 -left-4 h-16 w-16 rounded-full bg-white/10" />
                  <div className="absolute -bottom-3 left-1/3 h-10 w-10 rounded-full bg-white/5" />

                  <div className="relative flex items-center gap-4">
                    <span className="text-4xl drop-shadow">{badge.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-lg font-bold text-white">
                        كفووو من {r.sender_name}
                        <span className="text-sm font-medium text-white/50 me-2">{r.sender_department}</span>
                      </p>
                      {r.badge && (
                        <span className="inline-block mt-1 rounded-full bg-white/20 px-3 py-0.5 text-xs font-bold text-white backdrop-blur-sm">
                          {r.badge}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── Message area ── */}
                <div className="px-6 py-4">
                  {r.message && (
                    <p className="text-base text-gray-700 leading-relaxed mb-3">
                      {r.message}
                    </p>
                  )}
                  <p className="text-xs text-gray-400">
                    {timeAgo(r.created_at)}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Load more */}
          {hasMore && (
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white ring-1 ring-gray-200 px-6 py-4 text-sm font-bold text-primary-600 hover:bg-primary-50 hover:ring-primary-200 transition-all duration-200 disabled:opacity-50"
            >
              {loadingMore ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600" />
              ) : (
                <>عرض المزيد ({total - recognitions.length} متبقي)</>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
