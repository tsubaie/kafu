"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, X, Search } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import type { User, CreditBalance } from "@/lib/types";
import { cn } from "@/lib/utils";

const badges = [
  { id: "شقردي", label: "شقردي", emoji: "⚡", color: "from-amber-400 to-orange-500", ring: "ring-amber-300", bg: "bg-amber-50" },
  { id: "هب ريح", label: "هب ريح", emoji: "🔥", color: "from-red-400 to-rose-500", ring: "ring-red-300", bg: "bg-red-50" },
  { id: "فزعة", label: "فزعة", emoji: "🤝", color: "from-sky-400 to-blue-500", ring: "ring-sky-300", bg: "bg-sky-50" },
  { id: "متعاون", label: "متعاون", emoji: "💪", color: "from-emerald-400 to-teal-500", ring: "ring-emerald-300", bg: "bg-emerald-50" },
  { id: "فنّان", label: "فنّان", emoji: "🎨", color: "from-violet-400 to-purple-500", ring: "ring-violet-300", bg: "bg-violet-50" },
];

export default function SendRecognitionPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [credits, setCredits] = useState<CreditBalance | null>(null);
  const [loading, setLoading] = useState(true);

  const [receiverId, setReceiverId] = useState("");
  const [selectedBadge, setSelectedBadge] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/users").then((r) => r.json()),
      fetch("/api/me/credits").then((r) => r.json()),
    ])
      .then(([u, c]) => {
        setUsers(u);
        setCredits(c);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filteredUsers = users.filter(
    (u) => u.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectedUser = users.find((u) => u.id === receiverId);
  const remaining = credits?.remaining ?? 0;
  const activeBadge = badges.find((b) => b.id === selectedBadge);

  function selectUser(user: User) {
    setReceiverId(user.id);
    setSearch("");
    setDropdownOpen(false);
  }

  function clearSelection() {
    setReceiverId("");
    setSearch("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!receiverId || !selectedBadge) return;

    setSending(true);
    setError("");

    try {
      const res = await fetch("/api/recognitions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiver_id: receiverId,
          credits: 1,
          badge: selectedBadge,
          message: message.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "فشل إرسال الكفو");
        return;
      }

      window.dispatchEvent(new Event("credits-updated"));
      setSuccess(true);
      setTimeout(() => router.push("/inbox"), 2500);
    } catch {
      setError("حدث خطأ ما. يرجى المحاولة مرة أخرى.");
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  /* ── Success State ── */
  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-16 animate-[fadeIn_0.4s_ease-out]">
        <div className="relative">
          <img src="/icons/icons8-confetti.svg" alt="" className="h-24 w-24 animate-[bounce_0.6s_ease-out]" />
          {activeBadge && (
            <span className="absolute -bottom-1 -left-1 text-3xl animate-[spin_2s_linear_infinite]">
              {activeBadge.emoji}
            </span>
          )}
        </div>
        <h2 className="mt-6 text-2xl font-bold text-gray-900">
          تم إرسال الكفو! 🎉
        </h2>
        <p className="mt-2 text-base text-gray-500">
          <span className="font-semibold text-gray-700">{selectedUser?.name}</span> بيفرح فيها
        </p>
        {activeBadge && (
          <div className={cn("mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-l px-5 py-2 text-white font-semibold text-sm", activeBadge.color)}>
            <span className="text-lg">{activeBadge.emoji}</span>
            {activeBadge.label}
          </div>
        )}
      </div>
    );
  }

  /* ── No Credits State ── */
  if (remaining === 0) {
    return (
      <div className="mx-auto max-w-md py-10 animate-[fadeIn_0.3s_ease-out]">
        <div className="rounded-3xl bg-white p-10 text-center shadow-sm border border-gray-100">
          <img src="/icons/icons8-empty-hourglass.svg" alt="" className="mx-auto h-20 w-20 opacity-80" />
          <h2 className="mt-6 text-xl font-bold text-gray-900">
            خلصت الكفووات 😅
          </h2>
          <p className="mt-2 text-sm text-gray-500 leading-relaxed">
            استخدمت كل الكفووات هذا الشهر.
            <br />
            بترجع أول الشهر الجاي!
          </p>
        </div>
      </div>
    );
  }

  /* ── Main Form ── */
  return (
    <div className="mx-auto max-w-lg animate-[fadeIn_0.3s_ease-out]">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <img src="/icons/icons8-high-five.svg" alt="" className="h-10 w-10" />
          <h1 className="text-2xl font-bold text-gray-900">أرسل كفو</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="rounded-2xl bg-red-50 border border-red-100 p-4 text-sm text-red-700 font-medium">
            {error}
          </div>
        )}

        {/* ── Step 1: Pick a Person ── */}
        <div>
          <p className="text-sm font-semibold text-gray-800 mb-3">لمن تبي ترسل؟</p>
          <div ref={dropdownRef} className="relative">
            {selectedUser ? (
              <div className="flex items-center gap-4 rounded-2xl bg-gradient-to-l from-primary-50 to-primary-100/50 px-5 py-4 ring-1 ring-primary-200 transition-all">
                <Avatar name={selectedUser.name} size="md" className="shadow-md shadow-primary-500/10" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900">
                    {selectedUser.name}
                  </p>
                  <p className="text-xs text-primary-600 font-medium">{selectedUser.department}</p>
                </div>
                <button
                  type="button"
                  onClick={clearSelection}
                  className="rounded-full p-2 text-gray-400 hover:bg-white hover:text-gray-600 hover:shadow-sm transition-all"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setDropdownOpen(true);
                  setTimeout(() => inputRef.current?.focus(), 0);
                }}
                className={cn(
                  "flex w-full items-center justify-between rounded-2xl px-5 py-4 text-sm transition-all duration-200",
                  dropdownOpen
                    ? "bg-white ring-2 ring-primary-400 shadow-lg shadow-primary-500/10 text-primary-600"
                    : "bg-white ring-1 ring-gray-200 text-gray-400 hover:ring-primary-300 hover:shadow-md hover:text-primary-500"
                )}
              >
                <span className="font-medium">اختر زميلك...</span>
                <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", dropdownOpen && "rotate-180")} />
              </button>
            )}

            {dropdownOpen && !selectedUser && (
              <div className="absolute z-10 mt-2 w-full rounded-2xl bg-white shadow-2xl shadow-primary-900/15 ring-1 ring-primary-100 overflow-hidden animate-[fadeIn_0.15s_ease-out]">
                {/* Search header */}
                <div className="p-4 bg-gradient-to-b from-primary-600 to-primary-700">
                  <div className="relative">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder="ابحث بالاسم..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="block w-full rounded-xl bg-white/15 backdrop-blur-sm pe-11 ps-4 py-3 text-sm text-white placeholder-white/50 border-0 focus:bg-white/25 focus:outline-none focus:ring-0 transition-colors"
                    />
                  </div>
                </div>
                {/* People list */}
                <div className="max-h-64 overflow-y-auto p-2">
                  {filteredUsers.map((user, i) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => selectUser(user)}
                      className="group flex w-full items-center gap-4 rounded-xl px-4 py-3 text-start hover:bg-primary-50 transition-all duration-150"
                      style={{ animationDelay: `${i * 30}ms`, animation: "fadeIn 0.2s ease-out backwards" }}
                    >
                      <Avatar name={user.name} size="sm" className="transition-transform duration-150 group-hover:scale-110" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-800 group-hover:text-primary-700 transition-colors">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-400">{user.department}</p>
                      </div>
                      <span className="text-xs text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                        اختر
                      </span>
                    </button>
                  ))}
                  {filteredUsers.length === 0 && (
                    <div className="flex flex-col items-center py-8 text-center">
                      <span className="text-3xl mb-2">🤷</span>
                      <p className="text-sm text-gray-400 font-medium">ما لقينا أحد</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Step 2: Pick a Badge ── */}
        <div>
          <p className="text-sm font-semibold text-gray-800 mb-3">ليش كفو؟</p>
          <div className="grid grid-cols-5 gap-2">
            {badges.map((badge) => {
              const isSelected = selectedBadge === badge.id;
              return (
                <button
                  key={badge.id}
                  type="button"
                  onClick={() => setSelectedBadge(isSelected ? "" : badge.id)}
                  className={cn(
                    "group relative flex flex-col items-center gap-1.5 rounded-2xl p-3 transition-all duration-200",
                    isSelected
                      ? cn("bg-gradient-to-b text-white shadow-lg ring-2 scale-105", badge.color, badge.ring)
                      : cn("bg-white border border-gray-100 hover:shadow-md hover:scale-[1.03]", `hover:${badge.bg}`)
                  )}
                >
                  <span className={cn(
                    "text-2xl transition-transform duration-200",
                    isSelected && "scale-110"
                  )}>
                    {badge.emoji}
                  </span>
                  <span className={cn(
                    "text-xs font-bold leading-tight",
                    isSelected ? "text-white" : "text-gray-600"
                  )}>
                    {badge.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Step 3: Optional Message ── */}
        <div>
          <p className="text-sm font-semibold text-gray-800 mb-2">
            تبي تضيف شي؟
            <span className="text-gray-400 font-normal me-1">(اختياري)</span>
          </p>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={500}
            rows={2}
            className="block w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-sm text-gray-900 placeholder-gray-300 focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10 focus:outline-none resize-none transition-all"
            placeholder="اكتب رسالة..."
          />
        </div>

        {/* ── Submit ── */}
        <button
          type="submit"
          disabled={sending || !receiverId || !selectedBadge}
          className={cn(
            "group flex w-full items-center justify-center gap-3 rounded-2xl px-6 py-4 text-base font-bold text-white transition-all duration-200",
            receiverId && selectedBadge
              ? "bg-gradient-to-l from-primary-600 to-primary-500 shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 hover:scale-[1.01] active:scale-[0.99]"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          )}
        >
          <img
            src="/icons/icons8-high-five.svg"
            alt=""
            className={cn(
              "h-6 w-6 transition-transform duration-200",
              receiverId && selectedBadge && "group-hover:rotate-12"
            )}
          />
          {sending ? "جارٍ الإرسال..." : "أرسل كفو 🚀"}
        </button>
      </form>
    </div>
  );
}
