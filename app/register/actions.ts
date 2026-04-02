"use server";

import bcrypt from "bcryptjs";
import { query } from "@/lib/db";
import { signIn } from "@/lib/auth";
import { registerSchema } from "@/lib/validations";
import { AuthError } from "next-auth";
import { ZodError } from "zod";

export async function registerAction(
  _prevState: { error: string } | null,
  formData: FormData
) {
  try {
    const data = registerSchema.parse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      department: formData.get("department"),
    });

    const confirmPassword = formData.get("confirmPassword") as string;
    if (data.password !== confirmPassword) {
      return { error: "Passwords do not match" };
    }

    // Check if email already exists
    const existing = await query(
      `SELECT id FROM users WHERE email = $1`,
      [data.email]
    );
    if (existing.rows.length > 0) {
      return { error: "An account with this email already exists" };
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    await query(
      `INSERT INTO users (name, email, password_hash, department)
       VALUES ($1, $2, $3, $4)`,
      [data.name, data.email, passwordHash, data.department]
    );

    await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirectTo: "/dashboard",
    });

    return null;
  } catch (error) {
    if (error instanceof ZodError) {
      return { error: error.issues[0].message };
    }
    if (error instanceof AuthError) {
      return { error: "Account created but could not sign in. Please try logging in." };
    }
    throw error;
  }
}
