"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConfirmModal } from "@/components/ui/confirm-modal";

const badgeEmojis: Record<string, string> = {
  "شقردي": "⚡",
  "هب ريح": "🔥",
  "فزعة": "🤝",
  "متعاون": "💪",
  "فنّان": "🎨",
};

type Tab = "recognitions" | "users";

interface AdminRecognition {
  id: string;
  credits: number;
  badge: string | null;
  message: string;
  created_at: string;
  sender_name: string;
  sender_department: string;
  receiver_name: string;
  receiver_department: string;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  department: string | null;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
  received_credits: number;
  sent_credits: number;
  active_bonus: number;
  current_balance: number;
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

export default function AdminPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("recognitions");

  // Recognitions state
  const [recognitions, setRecognitions] = useState<AdminRecognition[]>([]);
  const [recTotal, setRecTotal] = useState(0);
  const [recSearch, setRecSearch] = useState("");
  const [recSearchInput, setRecSearchInput] = useState("");

  // Users state
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [userSearch, setUserSearch] = useState("");
  const [userSearchInput, setUserSearchInput] = useState("");
  const [userFilter, setUserFilter] = useState("all");

  const [loading, setLoading] = useState(true);

  // Modal state
  const [modal, setModal] = useState<{
    open: boolean;
    title: string;
    description?: string;
    confirmLabel: string;
    variant: "danger" | "primary" | "warning";
    onConfirm: () => Promise<void>;
  }>({ open: false, title: "", confirmLabel: "", variant: "danger", onConfirm: async () => {} });
  const [modalLoading, setModalLoading] = useState(false);

  // Bonus state
  const [bonusUser, setBonusUser] = useState<string | null>(null);
  const [bonusCredits, setBonusCredits] = useState(1);

  useEffect(() => {
    if (session && !session.user.isAdmin) {
      router.push("/inbox");
    }
  }, [session, router]);

  const loadRecognitions = useCallback((offset = 0, search = recSearch) => {
    const params = new URLSearchParams({ offset: String(offset) });
    if (search) params.set("q", search);
    return fetch(`/api/admin/recognitions?${params}`)
      .then((r) => r.json())
      .then((data: { items: AdminRecognition[]; total: number }) => {
        if (offset === 0) {
          setRecognitions(data.items);
        } else {
          setRecognitions((prev) => [...prev, ...data.items]);
        }
        setRecTotal(data.total);
      });
  }, [recSearch]);

  const loadUsers = useCallback((offset = 0, search = userSearch, filter = userFilter) => {
    const params = new URLSearchParams({ offset: String(offset), filter });
    if (search) params.set("q", search);
    return fetch(`/api/admin/users?${params}`)
      .then((r) => r.json())
      .then((data: { items: AdminUser[]; total: number }) => {
        if (offset === 0) {
          setUsers(data.items);
        } else {
          setUsers((prev) => [...prev, ...data.items]);
        }
        setUsersTotal(data.total);
      });
  }, [userSearch, userFilter]);

  useEffect(() => {
    Promise.all([loadRecognitions(0, ""), loadUsers(0, "", "all")])
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Debounced search for recognitions
  useEffect(() => {
    const t = setTimeout(() => {
      setRecSearch(recSearchInput);
      loadRecognitions(0, recSearchInput).catch(console.error);
    }, 300);
    return () => clearTimeout(t);
  }, [recSearchInput]);

  // Debounced search for users
  useEffect(() => {
    const t = setTimeout(() => {
      setUserSearch(userSearchInput);
      loadUsers(0, userSearchInput, userFilter).catch(console.error);
    }, 300);
    return () => clearTimeout(t);
  }, [userSearchInput, userFilter]);

  function showModal(opts: Omit<typeof modal, "open">) {
    setModal({ ...opts, open: true });
  }

  async function handleModalConfirm() {
    setModalLoading(true);
    try {
      await modal.onConfirm();
    } finally {
      setModalLoading(false);
      setModal((m) => ({ ...m, open: false }));
    }
  }

  function handleDelete(id: string) {
    showModal({
      title: "حذف الكفو",
      description: "هل أنت متأكد من حذف هذا الكفو؟ لا يمكن التراجع عن هذا الإجراء.",
      confirmLabel: "حذف",
      variant: "danger",
      onConfirm: async () => {
        const res = await fetch("/api/admin/recognitions", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        if (res.ok) {
          setRecognitions((prev) => prev.filter((r) => r.id !== id));
          setRecTotal((prev) => prev - 1);
          loadUsers(0, userSearch, userFilter).catch(console.error);
        }
      },
    });
  }

  function handleToggleUser(id: string, name: string, currentActive: boolean) {
    const action = currentActive ? "تعطيل" : "تفعيل";
    showModal({
      title: `${action} ${name}`,
      description: currentActive
        ? "لن يتمكن الموظف من تسجيل الدخول أو إرسال كفووات."
        : "سيتمكن الموظف من تسجيل الدخول واستخدام المنصة.",
      confirmLabel: action,
      variant: currentActive ? "danger" : "primary",
      onConfirm: async () => {
        const res = await fetch("/api/admin/users", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, is_active: !currentActive }),
        });
        if (res.ok) {
          setUsers((prev) =>
            prev.map((u) => (u.id === id ? { ...u, is_active: !currentActive } : u))
          );
        }
      },
    });
  }

  function handleGrantBonus(userId: string, userName: string) {
    showModal({
      title: "منح رصيد إضافي",
      description: `منح ${bonusCredits} كفو إضافي لـ ${userName} (ينتهي بعد ٣٠ يوم)`,
      confirmLabel: "منح",
      variant: "warning",
      onConfirm: async () => {
        const res = await fetch("/api/admin/bonus-credits", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId, credits: bonusCredits }),
        });
        if (res.ok) {
          setBonusUser(null);
          setBonusCredits(1);
          loadUsers(0, userSearch, userFilter).catch(console.error);
        }
      },
    });
  }

  if (!session?.user.isAdmin) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  const hasMoreRec = recognitions.length < recTotal;
  const hasMoreUsers = users.length < usersTotal;

  return (
    <div className="mx-auto max-w-3xl animate-[fadeIn_0.3s_ease-out]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <img src="/icons/icons8-admin.svg" alt="" className="h-10 w-10" />
        <h1 className="text-2xl font-bold text-gray-900">لوحة الإدارة</h1>
      </div>

      {/* Tabs */}
      <div className="flex rounded-2xl bg-white p-1 ring-1 ring-gray-200 shadow-sm mb-6">
        {([
          { id: "recognitions" as Tab, label: "الكفووات", count: recTotal },
          { id: "users" as Tab, label: "الموظفون", count: usersTotal },
        ]).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex-1 rounded-xl px-5 py-2.5 text-sm font-bold transition-all duration-200",
              tab === t.id
                ? "bg-gradient-to-l from-primary-600 to-primary-500 text-white shadow-md"
                : "text-gray-400 hover:text-gray-600"
            )}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {/* ═══ Recognitions Tab ═══ */}
      {tab === "recognitions" && (
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="ابحث بالاسم..."
              value={recSearchInput}
              onChange={(e) => setRecSearchInput(e.target.value)}
              className="block w-full rounded-2xl bg-white ring-1 ring-gray-200 ps-11 pe-5 py-3 text-sm placeholder-gray-400 focus:ring-2 focus:ring-primary-400 focus:outline-none transition-all"
            />
          </div>

          {recognitions.length === 0 ? (
            <p className="text-center text-gray-400 py-12">لا توجد نتائج</p>
          ) : (
            <div className="space-y-3">
              {recognitions.map((r) => (
                <div
                  key={r.id}
                  className="rounded-2xl bg-white ring-1 ring-gray-100 p-5 transition-all hover:shadow-md"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900">
                        من {r.sender_name} <span className="text-gray-400/50 font-medium">({r.sender_department})</span>
                        <span className="text-gray-400 font-medium mx-1">إلى</span>
                        {r.receiver_name} <span className="text-gray-400/50 font-medium">({r.receiver_department})</span>
                      </p>
                      {r.badge && (
                        <span className="inline-flex items-center gap-1 mt-1.5 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-bold text-gray-700">
                          {badgeEmojis[r.badge] && <span>{badgeEmojis[r.badge]}</span>}
                          {r.badge}
                        </span>
                      )}
                      {r.message && (
                        <p className="text-sm text-gray-600 mt-1.5">{r.message}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">{timeAgo(r.created_at)}</p>
                    </div>
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="shrink-0 rounded-xl bg-red-50 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-100 transition-colors"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              ))}

              {hasMoreRec && (
                <button
                  onClick={() => loadRecognitions(recognitions.length)}
                  className="flex w-full items-center justify-center rounded-2xl bg-white ring-1 ring-gray-200 px-6 py-4 text-sm font-bold text-primary-600 hover:bg-primary-50 transition-all"
                >
                  عرض المزيد ({recTotal - recognitions.length} متبقي)
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ═══ Users Tab ═══ */}
      {tab === "users" && (
        <div className="space-y-4">
          {/* Search + Filter */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="ابحث بالاسم أو البريد أو الإدارة..."
                value={userSearchInput}
                onChange={(e) => setUserSearchInput(e.target.value)}
                className="block w-full rounded-2xl bg-white ring-1 ring-gray-200 ps-11 pe-5 py-3 text-sm placeholder-gray-400 focus:ring-2 focus:ring-primary-400 focus:outline-none transition-all"
              />
            </div>
            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="rounded-2xl bg-white ring-1 ring-gray-200 px-4 py-3 text-sm font-bold text-gray-600 focus:ring-2 focus:ring-primary-400 focus:outline-none"
            >
              <option value="all">الكل</option>
              <option value="active">مفعّل</option>
              <option value="inactive">معطّل</option>
            </select>
          </div>

          {users.length === 0 ? (
            <p className="text-center text-gray-400 py-12">لا توجد نتائج</p>
          ) : (
            <div className="space-y-3">
              {users.map((u) => (
                <div
                  key={u.id}
                  className={cn(
                    "rounded-2xl ring-1 p-5 transition-all hover:shadow-md",
                    u.is_active
                      ? "bg-white ring-gray-100"
                      : "bg-gray-50 ring-gray-200 opacity-60"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-base font-bold text-gray-900">{u.name}</p>
                        {u.is_admin && (
                          <span className="rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-bold text-primary-700">
                            مدير
                          </span>
                        )}
                        {!u.is_active && (
                          <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600">
                            معطّل
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">{u.email} · {u.department}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        استلم {u.received_credits} كفو · أرسل {u.sent_credits} كفو
                        {u.active_bonus > 0 && (
                          <span className="text-amber-600"> · +{u.active_bonus} رصيد إضافي</span>
                        )}
                      </p>
                      <p className="text-xs font-bold text-primary-600 mt-0.5">
                        الرصيد الحالي: {Math.max(0, u.current_balance)} كفو
                      </p>
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      {u.is_active && !u.is_admin && (
                        <button
                          onClick={() => {
                            setBonusUser(bonusUser === u.id ? null : u.id);
                            setBonusCredits(1);
                          }}
                          className="rounded-xl bg-amber-50 px-3 py-2 text-xs font-bold text-amber-600 hover:bg-amber-100 transition-colors"
                        >
                          رصيد إضافي
                        </button>
                      )}
                      {!u.is_admin && (
                        <button
                          onClick={() => handleToggleUser(u.id, u.name, u.is_active)}
                          className={cn(
                            "rounded-xl px-4 py-2 text-xs font-bold transition-colors",
                            u.is_active
                              ? "bg-red-50 text-red-600 hover:bg-red-100"
                              : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                          )}
                        >
                          {u.is_active ? "تعطيل" : "تفعيل"}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Bonus credits inline form */}
                  {bonusUser === u.id && (
                    <div className="mt-4 flex items-center gap-3 rounded-xl bg-amber-50 p-4 animate-[fadeIn_0.2s_ease-out]">
                      <img src="/icons/icons8-coins.svg" alt="" className="h-8 w-8" />
                      <div className="flex-1">
                        <p className="text-xs font-bold text-amber-700 mb-2">
                          منح رصيد إضافي (ينتهي بعد ٣٠ يوم)
                        </p>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={1}
                            max={5}
                            value={bonusCredits}
                            onChange={(e) => setBonusCredits(Math.min(5, Math.max(1, parseInt(e.target.value) || 1)))}
                            className="w-20 rounded-lg border border-amber-200 px-3 py-1.5 text-sm text-center font-bold text-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-300"
                          />
                          <span className="text-xs text-amber-600 font-medium">كفو (الحد الأقصى ٥)</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleGrantBonus(u.id, u.name)}
                        className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-white hover:bg-amber-600 transition-colors"
                      >
                        منح
                      </button>
                      <button
                        onClick={() => setBonusUser(null)}
                        className="rounded-xl bg-white px-3 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                      >
                        إلغاء
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {hasMoreUsers && (
                <button
                  onClick={() => loadUsers(users.length)}
                  className="flex w-full items-center justify-center rounded-2xl bg-white ring-1 ring-gray-200 px-6 py-4 text-sm font-bold text-primary-600 hover:bg-primary-50 transition-all"
                >
                  عرض المزيد ({usersTotal - users.length} متبقي)
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        open={modal.open}
        title={modal.title}
        description={modal.description}
        confirmLabel={modal.confirmLabel}
        confirmVariant={modal.variant}
        loading={modalLoading}
        onConfirm={handleModalConfirm}
        onCancel={() => setModal((m) => ({ ...m, open: false }))}
      />
    </div>
  );
}
