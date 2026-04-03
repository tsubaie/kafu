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
    <div className={cn("flex flex-col items-center justify-center py-12 text-center", className)}>
      <img src={iconSrc} alt="" className="h-16 w-16 mb-4" />
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
    </div>
  );
}
