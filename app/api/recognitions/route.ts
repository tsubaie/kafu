import { NextRequest, NextResponse } from "next/server";
import { query, withTransaction } from "@/lib/db";
import { getSessionOrThrow } from "@/lib/authorization";
import { sendRecognitionSchema } from "@/lib/validations";
import { ZodError } from "zod";

export const dynamic = "force-dynamic";

const MONTHLY_CREDITS = 5;

export async function GET() {
  try {
    await getSessionOrThrow();

    const result = await query(
      `SELECT r.id, r.sender_id, r.receiver_id, r.credits, r.message, r.created_at,
              s.name AS sender_name, s.department AS sender_department,
              rv.name AS receiver_name, rv.department AS receiver_department
       FROM recognitions r
       JOIN users s ON s.id = r.sender_id
       JOIN users rv ON rv.id = r.receiver_id
       ORDER BY r.created_at DESC
       LIMIT 50`
    );

    return NextResponse.json(result.rows);
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[api/recognitions] GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionOrThrow();
    const body = await request.json();
    const data = sendRecognitionSchema.parse(body);

    if (data.receiver_id === session.user.id) {
      return NextResponse.json(
        { error: "You cannot recognize yourself" },
        { status: 400 }
      );
    }

    const recognition = await withTransaction(async (client) => {
      // Check remaining credits this month
      const creditResult = await client.query(
        `SELECT COALESCE(SUM(credits), 0)::int AS used
         FROM recognitions
         WHERE sender_id = $1
           AND created_at >= date_trunc('month', NOW())`,
        [session.user.id]
      );

      const used = creditResult.rows[0].used;
      const remaining = MONTHLY_CREDITS - used;

      if (data.credits > remaining) {
        throw new Error(
          `Not enough credits. You have ${remaining} remaining this month.`
        );
      }

      // Verify receiver exists
      const receiverResult = await client.query(
        `SELECT id FROM users WHERE id = $1 AND is_active = TRUE`,
        [data.receiver_id]
      );

      if (receiverResult.rows.length === 0) {
        throw new Error("Employee not found");
      }

      // Insert recognition
      const insertResult = await client.query(
        `INSERT INTO recognitions (sender_id, receiver_id, credits, message)
         VALUES ($1, $2, $3, $4)
         RETURNING id, sender_id, receiver_id, credits, message, created_at`,
        [session.user.id, data.receiver_id, data.credits, data.message]
      );

      return insertResult.rows[0];
    });

    return NextResponse.json(recognition, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (err instanceof ZodError) {
      return NextResponse.json(
        { error: err.issues[0].message },
        { status: 400 }
      );
    }
    if (err instanceof Error && (err.message.includes("Not enough credits") || err.message === "Employee not found")) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("[api/recognitions] POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
