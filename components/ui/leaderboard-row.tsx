import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { LeaderboardEntry } from "@/lib/types";

const rankStyles: Record<number, string> = {
  1: "text-gold",
  2: "text-silver",
  3: "text-bronze",
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
      <span
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold",
          rank <= 3
            ? cn(rankStyles[rank], "bg-gray-50")
            : "text-gray-400"
        )}
      >
        {rank}
      </span>
      <Avatar name={entry.name} size="sm" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">
          {entry.name}
        </p>
        <p className="text-xs text-gray-500">{entry.department}</p>
      </div>
      <div className="text-right">
        <p className="text-lg font-bold text-primary-600">
          {entry.total_credits}
        </p>
        <p className="text-xs text-gray-500">
          {entry.recognition_count} {entry.recognition_count === 1 ? "recognition" : "recognitions"}
        </p>
      </div>
    </div>
  );
}
