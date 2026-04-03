"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { RecognitionCard } from "@/components/ui/recognition-card";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import type { Recognition } from "@/lib/types";

type Tab = "received" | "sent";

export default function ProfilePage() {
  const params = useParams();
  const { data: session } = useSession();
  const [recognitions, setRecognitions] = useState<Recognition[]>([]);
  const [tab, setTab] = useState<Tab>("received");
  const [loading, setLoading] = useState(true);

  const userId = params.id as string;
  const isOwnProfile = session?.user?.id === userId;

  useEffect(() => {
    fetch("/api/recognitions")
      .then((r) => r.json())
      .then((all: Recognition[]) => {
        setRecognitions(all);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = recognitions.filter((r) =>
    tab === "received" ? r.receiver_id === userId : r.sender_id === userId
  );

  const userName =
    tab === "received"
      ? filtered[0]?.receiver_name
      : filtered[0]?.sender_name;

  const displayName = isOwnProfile
    ? session?.user?.name ?? "أنت"
    : userName ?? "موظف";

  const department = isOwnProfile
    ? session?.user?.department
    : tab === "received"
      ? filtered[0]?.receiver_department
      : filtered[0]?.sender_department;

  return (
    <div className="mx-auto max-w-2xl">
      {/* Profile Header */}
      <div className="flex items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{displayName}</h1>
          {department && (
            <p className="text-sm text-gray-500">{department}</p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-4">
        {(["received", "sent"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px",
              tab === t
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            )}
          >
            {t === "received" ? "المستلمة" : "المُرسلة"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          iconSrc={tab === "received" ? "/icons/icons8-star.svg" : "/icons/icons8-high-five.svg"}
          title={tab === "received" ? "لا توجد تقديرات مستلمة" : "لا توجد تقديرات مُرسلة"}
          description={
            tab === "received"
              ? "لم يتم استلام أي تقديرات بعد."
              : "لم يتم إرسال أي تقديرات بعد."
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <RecognitionCard key={r.id} recognition={r} />
          ))}
        </div>
      )}
    </div>
  );
}
