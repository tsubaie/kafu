import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getAdminSessionOrThrow } from "@/lib/authorization";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 30;

export async function GET(request: NextRequest) {
  try {
    await getAdminSessionOrThrow();

    const { searchParams } = request.nextUrl;
    const offset = parseInt(searchParams.get("offset") ?? "0", 10);
    const search = searchParams.get("q") ?? "";
    const filter = searchParams.get("filter") ?? "all"; // all, active, inactive

    const searchFilter = search
      ? `AND (u.name ILIKE $1 OR u.email ILIKE $1 OR u.department ILIKE $1)`
      : "";
    const statusFilter =
      filter === "active" ? "AND u.is_active = TRUE" :
      filter === "inactive" ? "AND u.is_active = FALSE" : "";

    const searchParam = search ? `%${search}%` : null;

    const baseWhere = `WHERE TRUE ${searchFilter} ${statusFilter}`;
    const queryParams = searchParam ? [searchParam] : [];

    const [dataResult, countResult] = await Promise.all([
      query(
        `SELECT u.id, u.name, u.email, u.department, u.is_active, u.is_admin, u.created_at,
                COALESCE(received.total, 0)::int AS received_credits,
                COALESCE(sent.total, 0)::int AS sent_credits,
                COALESCE(bonus.active_bonus, 0)::int AS active_bonus,
                (5 + COALESCE(bonus.active_bonus, 0) - COALESCE(month_sent.total, 0))::int AS current_balance
         FROM users u
         LEFT JOIN (
           SELECT receiver_id, SUM(credits) AS total FROM recognitions GROUP BY receiver_id
         ) received ON received.receiver_id = u.id
         LEFT JOIN (
           SELECT sender_id, SUM(credits) AS total FROM recognitions GROUP BY sender_id
         ) sent ON sent.sender_id = u.id
         LEFT JOIN (
           SELECT user_id, SUM(credits) AS active_bonus FROM bonus_credits WHERE expires_at > NOW() GROUP BY user_id
         ) bonus ON bonus.user_id = u.id
         LEFT JOIN (
           SELECT sender_id, SUM(credits) AS total FROM recognitions WHERE created_at >= date_trunc('month', NOW()) GROUP BY sender_id
         ) month_sent ON month_sent.sender_id = u.id
         ${baseWhere}
         ORDER BY u.name
         LIMIT ${PAGE_SIZE} OFFSET ${offset}`,
        queryParams
      ),
      query(
        `SELECT COUNT(*)::int AS total FROM users u ${baseWhere}`,
        queryParams
      ),
    ]);

    return NextResponse.json({
      items: dataResult.rows,
      total: countResult.rows[0].total,
    });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });
    }
    if (err instanceof Error && err.message === "Forbidden") {
      return NextResponse.json({ error: "غير مسموح" }, { status: 403 });
    }
    console.error("[api/admin/users] GET error:", err);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getAdminSessionOrThrow();

    const { id, is_active } = await request.json();
    if (!id || typeof is_active !== "boolean") {
      return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 400 });
    }

    if (id === session.user.id) {
      return NextResponse.json({ error: "لا يمكنك تعطيل نفسك" }, { status: 400 });
    }

    const result = await query(
      `UPDATE users SET is_active = $1, updated_at = NOW() WHERE id = $2 RETURNING id, name, is_active`,
      [is_active, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "الموظف غير موجود" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });
    }
    if (err instanceof Error && err.message === "Forbidden") {
      return NextResponse.json({ error: "غير مسموح" }, { status: 403 });
    }
    console.error("[api/admin/users] PATCH error:", err);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
