import { cn } from "@/lib/utils";

export function EmptyState({
  iconSrc,
  title,
  description,
  className,
}: {
  iconSrc: string;
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 text-center animate-[fadeIn_0.4s_ease-out]", className)}>
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gray-50 mb-5">
        <img src={iconSrc} alt="" className="h-12 w-12 opacity-80" />
      </div>
      <h3 className="text-base font-bold text-gray-900">{title}</h3>
      <p className="mt-1.5 text-sm text-gray-400 max-w-xs leading-relaxed">{description}</p>
    </div>
  );
}
