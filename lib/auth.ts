import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";
import { authConfig } from "@/lib/auth.config";
import { checkRateLimit, resetRateLimit } from "@/lib/rate-limit";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const email = credentials?.email as string;
        const password = credentials?.password as string;
        if (!email || !password) return null;

        const limit = checkRateLimit(email.toLowerCase());
        if (!limit.allowed) return null;

        const result = await query(
          `SELECT id, email, password_hash, name, department, avatar_url, is_admin
           FROM users WHERE email = $1 AND is_active = TRUE`,
          [email]
        );

        const user = result.rows[0];
        if (!user) {
          await new Promise((r) => setTimeout(r, 300 + Math.random() * 200));
          return null;
        }

        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) return null;

        resetRateLimit(email.toLowerCase());

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          department: user.department,
          avatarUrl: user.avatar_url,
          isAdmin: user.is_admin ?? false,
        };
      },
    }),
  ],
});
