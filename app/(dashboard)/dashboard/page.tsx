"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RecognitionCard } from "@/components/ui/recognition-card";
import { EmptyState } from "@/components/ui/empty-state";
import type { Recognition, CreditBalance } from "@/lib/types";

export default function DashboardPage() {
  const [credits, setCredits] = useState<CreditBalance | null>(null);
  const [recognitions, setRecognitions] = useState<Recognition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/me/credits").then((r) => r.json()),
      fetch("/api/recognitions").then((r) => r.json()),
    ])
      .then(([c, r]) => {
        setCredits(c);
        setRecognitions(r);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Credits Card */}
      <div className="rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-primary-100">
              الرصيد المتبقي
            </p>
            <p className="mt-1 text-4xl font-bold">
              {credits?.remaining ?? 0}
              <span className="text-lg font-normal text-primary-200">
                /{credits?.total ?? 5}
              </span>
            </p>
            <p className="mt-1 text-sm text-primary-200">
              {credits?.used ?? 0} مستخدم هذا الشهر
            </p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <img src="/icons/icons8-coins.svg" alt="" className="h-12 w-12" />
            <Link
              href="/send"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-primary-700 transition-colors hover:bg-primary-50"
            >
              <img src="/icons/icons8-high-five.svg" alt="" className="h-5 w-5" />
              إرسال تقدير
            </Link>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-4 h-2 rounded-full bg-primary-800/40">
          <div
            className="h-full rounded-full bg-white/80 transition-all"
            style={{
              width: `${((credits?.remaining ?? 0) / (credits?.total ?? 5)) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Recent Recognitions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          آخر التقديرات
        </h2>
        {recognitions.length === 0 ? (
          <EmptyState
            iconSrc="/icons/icons8-star.svg"
            title="لا توجد تقديرات بعد"
            description="كن أول من يقدّر زميلاً!"
          />
        ) : (
          <div className="space-y-3">
            {recognitions.map((r) => (
              <RecognitionCard key={r.id} recognition={r} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
