import Link from "next/link";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-full items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <img src="/logo.svg" alt="كفوو" className="mx-auto h-12" />
          <h1 className="mt-4 text-2xl font-bold text-gray-900">
            مرحباً بك في كفوو
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            سجّل دخولك لتقدير زملائك
          </p>
        </div>

        <LoginForm />

        <p className="text-center text-sm text-gray-500">
          ليس لديك حساب؟{" "}
          <Link
            href="/register"
            className="font-medium text-primary-600 hover:text-primary-700"
          >
            تسجيل حساب جديد
          </Link>
        </p>
      </div>
    </div>
  );
}
