"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/inbox", label: "صندوق الوارد", icon: "/icons/icons8-alarm.svg" },
  { href: "/send", label: "أرسل كفو", icon: "/icons/icons8-high-five.svg" },
  { href: "/leaderboard", label: "المتصدرون", icon: "/icons/icons8-trophy.svg" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-72 flex-col bg-gradient-to-b from-primary-700 via-primary-700 to-primary-800 relative overflow-hidden">
      {/* Decorative shapes */}
      <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-white/5" />
      <div className="absolute bottom-20 -left-6 h-20 w-20 rounded-full bg-white/5" />
      <div className="absolute top-1/2 right-4 h-12 w-12 rounded-full bg-white/3" />

      {/* Brand */}
      <div className="relative flex items-center gap-3 px-7 pt-8 pb-6">
        <img src="/adaa-logo-white.svg" alt="أداء" className="h-9" />
        <span className="text-xl font-bold text-white tracking-wide">كفوو</span>
      </div>

      {/* Navigation */}
      <nav className="relative flex-1 px-4 py-4 space-y-1.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3.5 rounded-2xl px-4 py-3.5 text-sm font-bold transition-all duration-200",
                isActive
                  ? "bg-white/20 text-white shadow-lg shadow-primary-900/20 backdrop-blur-sm"
                  : "text-primary-100 hover:bg-white/10 hover:text-white"
              )}
            >
              <img
                src={item.icon}
                alt=""
                className={cn(
                  "h-6 w-6 transition-transform duration-200",
                  isActive ? "scale-110" : "group-hover:scale-105 opacity-80 group-hover:opacity-100"
                )}
              />
              {item.label}
              {isActive && (
                <div className="mr-auto h-2 w-2 rounded-full bg-white shadow-sm shadow-white/50" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Sign Out */}
      <div className="relative px-4 pb-6">
        <button
          onClick={async () => {
            await signOut({ redirect: false });
            window.location.href = "/login";
          }}
          className="flex w-full items-center gap-3.5 rounded-2xl px-4 py-3 text-sm font-medium text-primary-200 hover:bg-white/10 hover:text-white transition-all duration-200"
        >
          <LogOut className="h-5 w-5" />
          تسجيل الخروج
        </button>
      </div>
    </aside>
  );
}
