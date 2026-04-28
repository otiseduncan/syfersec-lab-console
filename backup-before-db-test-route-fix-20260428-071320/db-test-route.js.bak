import { sql } from "@/lib/db";

export async function GET() {
  try {
    const result = await sql`SELECT NOW() as current_time`;

    return Response.json({
      ok: true,
      message: "Connected to Neon database",
      time: result[0].current_time,
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        message: "Database connection failed",
        error: error.message,
      },
      { status: 500 }
    );
  }
}