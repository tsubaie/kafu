import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSessionOrThrow } from "@/lib/authorization";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSessionOrThrow();

    const result = await query(
      `SELECT r.id, r.sender_id, r.receiver_id, r.credits, r.message, r.created_at,
              s.name AS sender_name, s.department AS sender_department
       FROM recognitions r
       JOIN users s ON s.id = r.sender_id
       WHERE r.receiver_id = $1
       ORDER BY r.created_at DESC`,
      [session.user.id]
    );

    return NextResponse.json(result.rows);
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[api/me/recognitions] GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
