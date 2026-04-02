import Link from "next/link";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-full items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <img src="/logo.svg" alt="ADAA" className="mx-auto h-10" />
          <h1 className="mt-4 text-2xl font-bold text-gray-900">
            Welcome to Kafu
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Sign in to recognize your colleagues
          </p>
        </div>

        <LoginForm />

        <p className="text-center text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-primary-600 hover:text-primary-700"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
