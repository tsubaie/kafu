import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { LeaderboardEntry } from "@/lib/types";

const ribbonIcons: Record<number, string> = {
  1: "/icons/icons8-first-place-ribbon.svg",
  2: "/icons/icons8-second-place-ribbon.svg",
  3: "/icons/icons8-third-place-ribbon.svg",
};

export function LeaderboardRow({
  entry,
  rank,
}: {
  entry: LeaderboardEntry;
  rank: number;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-xl border border-gray-200 bg-white px-4 py-3 transition-shadow hover:shadow-sm",
        rank <= 3 && "border-primary-100"
      )}
    >
      {rank <= 3 ? (
        <img src={ribbonIcons[rank]} alt={`#${rank}`} className="h-8 w-8" />
      ) : (
        <span className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-gray-400">
          {rank}
        </span>
      )}
      <Avatar name={entry.name} size="sm" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">
          {entry.name}
        </p>
        <p className="text-xs text-gray-500">{entry.department}</p>
      </div>
      <div className="text-start">
        <p className="text-lg font-bold text-primary-600">
          {entry.total_credits}
        </p>
        <p className="text-xs text-gray-500">
          {entry.recognition_count} تقدير
        </p>
      </div>
    </div>
  );
}
