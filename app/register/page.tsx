import Link from "next/link";
import { RegisterForm } from "./register-form";

export default function RegisterPage() {
  return (
    <div className="flex min-h-full items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <img src="/logo.svg" alt="ADAA" className="mx-auto h-10" />
          <h1 className="mt-4 text-2xl font-bold text-gray-900">
            Join Kafu
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Create your account to start recognizing colleagues
          </p>
        </div>

        <RegisterForm />

        <p className="text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-primary-600 hover:text-primary-700"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
