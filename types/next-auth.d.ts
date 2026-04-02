import "next-auth";

declare module "next-auth" {
  interface User {
    department: string | null;
    avatarUrl: string | null;
  }
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      department: string | null;
      avatarUrl: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    department: string | null;
    avatarUrl: string | null;
  }
}
