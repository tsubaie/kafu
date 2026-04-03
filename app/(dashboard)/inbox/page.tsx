"use client";

import { useEffect, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import type { CreditBalance } from "@/lib/types";

interface ReceivedRecognition {
  id: string;
  credits: number;
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
  const [credits, setCredits] = useState<CreditBalance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/me/recognitions").then((r) => r.json()),
      fetch("/api/me/credits").then((r) => r.json()),
    ])
      .then(([r, c]) => {
        setRecognitions(r);
        setCredits(c);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalReceived = recognitions.reduce((sum, r) => sum + r.credits, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">الأرصدة المستلمة</p>
          <p className="mt-1 text-3xl font-bold text-primary-600">
            {totalReceived}
          </p>
          <p className="mt-0.5 text-xs text-gray-400">الإجمالي</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">أرصدة للإرسال</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">
            {credits?.remaining ?? 0}
            <span className="text-lg font-normal text-gray-400">
              /{credits?.total ?? 5}
            </span>
          </p>
          <p className="mt-0.5 text-xs text-gray-400">هذا الشهر</p>
        </div>
      </div>

      {/* Received Recognitions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          التقديرات المستلمة
        </h2>
        {recognitions.length === 0 ? (
          <EmptyState
            iconSrc="/icons/icons8-alarm.svg"
            title="لا توجد تقديرات بعد"
            description="عندما يقدّرك زملاؤك، ستظهر هنا."
          />
        ) : (
          <div className="space-y-3">
            {recognitions.map((r) => (
              <div
                key={r.id}
                className="rounded-xl border border-gray-200 bg-white p-4 transition-shadow hover:shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <Avatar name={r.sender_name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-900">
                        {r.sender_name}
                      </p>
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-700">
                        <img src="/icons/icons8-coins.svg" alt="" className="h-4 w-4" />
                        +{r.credits}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {r.sender_department}
                    </p>
                    <p className="mt-2 text-sm text-gray-700">{r.message}</p>
                    <p className="mt-1.5 text-xs text-gray-400">
                      {timeAgo(r.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
