import { Avatar } from "@/components/ui/avatar";
import type { Recognition } from "@/lib/types";

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

export function RecognitionCard({ recognition }: { recognition: Recognition }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 transition-shadow hover:shadow-sm">
      <div className="flex items-start gap-3">
        <Avatar name={recognition.sender_name ?? ""} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="text-sm">
            <span className="font-semibold text-gray-900">
              {recognition.sender_name}
            </span>
            <span className="text-gray-500"> قدّر </span>
            <span className="font-semibold text-gray-900">
              {recognition.receiver_name}
            </span>
          </p>
          <p className="mt-1.5 text-sm text-gray-700">{recognition.message}</p>
          <div className="mt-2 flex items-center gap-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-700">
              <img src="/icons/icons8-coins.svg" alt="" className="h-4 w-4" />
              {recognition.credits} رصيد
            </span>
            <span className="text-xs text-gray-400">
              {timeAgo(recognition.created_at)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
