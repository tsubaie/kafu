import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSessionOrThrow } from "@/lib/authorization";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionOrThrow();

    const { searchParams } = request.nextUrl;
    const offset = parseInt(searchParams.get("offset") ?? "0", 10);
    const limit = PAGE_SIZE;

    const [dataResult, countResult, creditsResult] = await Promise.all([
      query(
        `SELECT r.id, r.sender_id, r.receiver_id, r.credits, r.badge, r.message, r.created_at,
                s.name AS sender_name, s.department AS sender_department
         FROM recognitions r
         JOIN users s ON s.id = r.sender_id
         WHERE r.receiver_id = $1
         ORDER BY r.created_at DESC
         LIMIT $2 OFFSET $3`,
        [session.user.id, limit, offset]
      ),
      query(
        `SELECT COUNT(*)::int AS total FROM recognitions WHERE receiver_id = $1`,
        [session.user.id]
      ),
      query(
        `SELECT COALESCE(SUM(credits), 0)::int AS total_credits FROM recognitions WHERE receiver_id = $1`,
        [session.user.id]
      ),
    ]);

    return NextResponse.json({
      items: dataResult.rows,
      total: countResult.rows[0].total,
      totalCredits: creditsResult.rows[0].total_credits,
    });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });
    }
    console.error("[api/me/recognitions] GET error:", err);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
