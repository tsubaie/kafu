import type { NextAuthConfig } from "next-auth";

export const PUBLIC_ROUTES = ["/login", "/register", "/api/auth", "/api/health"];

export const authConfig: NextAuthConfig = {
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as { department?: string | null; avatarUrl?: string | null; isAdmin?: boolean };
        token.department = u.department ?? null;
        token.avatarUrl = u.avatarUrl ?? null;
        token.isAdmin = u.isAdmin ?? false;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.department = token.department as string | null;
        session.user.avatarUrl = token.avatarUrl as string | null;
        session.user.isAdmin = token.isAdmin as boolean;
      }
      return session;
    },
  },
  providers: [],
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
};
