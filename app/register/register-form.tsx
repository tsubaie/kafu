"use client";

import { useActionState } from "react";
import { registerAction } from "./actions";
import { UserPlus } from "lucide-react";

const departments = [
  { value: "Engineering", label: "الهندسة" },
  { value: "Design", label: "التصميم" },
  { value: "Product", label: "المنتجات" },
  { value: "Operations", label: "العمليات" },
  { value: "Finance", label: "المالية" },
  { value: "HR", label: "الموارد البشرية" },
  { value: "Legal", label: "الشؤون القانونية" },
  { value: "Marketing", label: "التسويق" },
];

export function RegisterForm() {
  const [state, action, isPending] = useActionState(registerAction, null);

  return (
    <form action={action} className="space-y-4">
      {state?.error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          الاسم الكامل
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
          placeholder="اسمك الكامل"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          البريد الإلكتروني
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
          placeholder="you@adaa.gov.sa"
        />
      </div>

      <div>
        <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
          الإدارة
        </label>
        <select
          id="department"
          name="department"
          required
          className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
        >
          <option value="">اختر الإدارة</option>
          {departments.map((dept) => (
            <option key={dept.value} value={dept.value}>
              {dept.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          كلمة المرور
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
          placeholder="٦ أحرف على الأقل"
        />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
          تأكيد كلمة المرور
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={6}
          className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
          placeholder="أعد كتابة كلمة المرور"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
      >
        <UserPlus className="h-4 w-4" />
        {isPending ? "جارٍ إنشاء الحساب..." : "إنشاء حساب"}
      </button>
    </form>
  );
}
