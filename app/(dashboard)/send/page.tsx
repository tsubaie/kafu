"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Send, CheckCircle, Coins, ChevronDown, X } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import type { User, CreditBalance } from "@/lib/types";

export default function SendRecognitionPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [credits, setCredits] = useState<CreditBalance | null>(null);
  const [loading, setLoading] = useState(true);

  const [receiverId, setReceiverId] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Dropdown state
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

  // Close dropdown on outside click
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
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.department?.toLowerCase().includes(search.toLowerCase())
  );

  const selectedUser = users.find((u) => u.id === receiverId);
  const remaining = credits?.remaining ?? 0;

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
    if (!receiverId || !message.trim()) return;

    setSending(true);
    setError("");

    try {
      const res = await fetch("/api/recognitions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiver_id: receiverId,
          credits: 1,
          message: message.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to send recognition");
        return;
      }

      // Tell the header to refresh credits
      window.dispatchEvent(new Event("credits-updated"));

      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 2000);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <CheckCircle className="h-16 w-16 text-primary-500" />
        <h2 className="mt-4 text-xl font-bold text-gray-900">
          Recognition Sent!
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {selectedUser?.name} will appreciate it
        </p>
      </div>
    );
  }

  if (remaining === 0) {
    return (
      <div className="mx-auto max-w-lg">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
          <Coins className="mx-auto h-12 w-12 text-gray-300" />
          <h2 className="mt-4 text-lg font-semibold text-gray-900">
            No Credits Remaining
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            You&apos;ve used all 5 credits this month. They&apos;ll reset at the start of next month.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-xl font-bold text-gray-900 mb-6">
        Send Recognition
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Employee Searchable Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Who do you want to recognize?
          </label>
          <div ref={dropdownRef} className="relative">
            {selectedUser ? (
              <div className="flex items-center gap-3 rounded-lg border border-primary-300 bg-primary-50 px-3 py-2.5">
                <Avatar name={selectedUser.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {selectedUser.name}
                  </p>
                  <p className="text-xs text-gray-500">{selectedUser.department}</p>
                </div>
                <button
                  type="button"
                  onClick={clearSelection}
                  className="rounded-full p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
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
                className="flex w-full items-center justify-between rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-400 hover:border-gray-400 transition-colors"
              >
                Select an employee...
                <ChevronDown className="h-4 w-4" />
              </button>
            )}

            {dropdownOpen && !selectedUser && (
              <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
                <div className="p-2">
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search by name or department..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="block w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:outline-none"
                  />
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {filteredUsers.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => selectUser(user)}
                      className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-gray-50 transition-colors"
                    >
                      <Avatar name={user.name} size="sm" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-500">{user.department}</p>
                      </div>
                    </button>
                  ))}
                  {filteredUsers.length === 0 && (
                    <p className="px-3 py-4 text-sm text-gray-500 text-center">
                      No employees found
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
            Why are you recognizing them?
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            maxLength={500}
            rows={3}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none resize-none"
            placeholder="Write a thank-you message..."
          />
          <p className="mt-1 text-xs text-gray-400 text-right">
            {message.length}/500
          </p>
        </div>

        <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
          <span className="text-sm text-gray-600">
            Credits remaining this month
          </span>
          <span className="text-sm font-semibold text-primary-700">
            {remaining}/{credits?.total ?? 5}
          </span>
        </div>

        <button
          type="submit"
          disabled={sending || !receiverId || !message.trim()}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          {sending ? "Sending..." : "Send 1 Credit"}
        </button>
      </form>
    </div>
  );
}
