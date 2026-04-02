import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSessionOrThrow } from "@/lib/authorization";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSessionOrThrow();

    const result = await query(
      `SELECT id, name, email, department, avatar_url
       FROM users
       WHERE is_active = TRUE AND id <> $1
       ORDER BY name`,
      [session.user.id]
    );

    return NextResponse.json(result.rows);
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[api/users] GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
