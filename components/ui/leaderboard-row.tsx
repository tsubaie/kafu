import type { LeaderboardEntry } from "@/lib/types";

export function LeaderboardRow({
  entry,
  rank,
  style,
}: {
  entry: LeaderboardEntry;
  rank: number;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className="group rounded-2xl bg-white ring-1 ring-gray-100 p-5 transition-all duration-200 hover:shadow-lg hover:ring-primary-200 hover:scale-[1.01]"
      style={style}
    >
      <div className="flex items-center gap-4">
        <img
          src="/icons/icons8-medal.svg"
          alt={`#${rank}`}
          className="shrink-0 h-11 w-11 drop-shadow transition-transform duration-200 group-hover:scale-110"
        />

        <div className="flex-1 min-w-0">
          <p className="text-base font-bold text-gray-900 truncate">
            {entry.name}
          </p>
          <p className="text-xs text-gray-400 font-medium">{entry.department}</p>
        </div>

        <div className="shrink-0 flex items-baseline gap-1.5 pe-2">
          <span className="text-3xl font-bold tabular-nums text-gray-600 transition-colors group-hover:text-primary-600">
            {entry.total_credits}
          </span>
          <span className="text-xs text-gray-400 font-bold">كفو</span>
        </div>
      </div>
    </div>
  );
}
