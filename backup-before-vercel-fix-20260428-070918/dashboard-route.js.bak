import { sql } from "@/lib/db";

export async function GET() {
  try {
    const totalAssets = await sql`
      SELECT COUNT(*)::int AS count FROM assets
    `;

    const highRiskAssets = await sql`
      SELECT COUNT(*)::int AS count 
      FROM assets 
      WHERE risk_level IN ('High', 'Critical')
    `;

    const openFindings = await sql`
      SELECT COUNT(*)::int AS count 
      FROM findings 
      WHERE status = 'Open'
    `;

    const criticalFindings = await sql`
      SELECT COUNT(*)::int AS count 
      FROM findings 
      WHERE severity = 'Critical'
    `;

    const eventsPendingReview = await sql`
      SELECT COUNT(*)::int AS count 
      FROM security_events 
      WHERE reviewed = false
    `;

    const recentAssets = await sql`
      SELECT id, hostname, ip_address, risk_level
      FROM assets
      ORDER BY created_at DESC
      LIMIT 5
    `;

    const recentFindings = await sql`
      SELECT 
        findings.id,
        findings.title,
        findings.severity,
        findings.status,
        assets.hostname
      FROM findings
      LEFT JOIN assets ON findings.asset_id = assets.id
      ORDER BY findings.created_at DESC
      LIMIT 5
    `;

    return Response.json({
      totalAssets: totalAssets[0].count,
      highRiskAssets: highRiskAssets[0].count,
      openFindings: openFindings[0].count,
      criticalFindings: criticalFindings[0].count,
      eventsPendingReview: eventsPendingReview[0].count,
      recentAssets,
      recentFindings,
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        message: "Dashboard query failed",
        error: error.message,
      },
      { status: 500 }
    );
  }
}