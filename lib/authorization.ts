import { auth } from "@/lib/auth";

export async function getSessionOrThrow() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  return session;
}
