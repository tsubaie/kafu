"use client";

import { cn } from "@/lib/utils";

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel,
  confirmVariant = "danger",
  loading,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel: string;
  confirmVariant?: "danger" | "primary" | "warning";
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  const variants = {
    danger: "bg-red-500 hover:bg-red-600 text-white",
    primary: "bg-primary-500 hover:bg-primary-600 text-white",
    warning: "bg-amber-500 hover:bg-amber-600 text-white",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />

      {/* Modal */}
      <div className="relative rounded-2xl bg-white p-6 shadow-2xl w-full max-w-sm mx-4 animate-[fadeIn_0.15s_ease-out]">
        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
        {description && (
          <p className="text-sm text-gray-500 mb-6">{description}</p>
        )}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className="rounded-xl bg-gray-100 px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-200 transition-colors"
          >
            إلغاء
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              "rounded-xl px-5 py-2.5 text-sm font-bold transition-colors disabled:opacity-50",
              variants[confirmVariant]
            )}
          >
            {loading ? "جارٍ..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
