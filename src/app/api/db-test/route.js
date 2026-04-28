export const runtime = "nodejs";

export async function GET() {
  const hasDatabase = Boolean(process.env.DATABASE_URL);

  if (!hasDatabase) {
    return Response.json({
      ok: true,
      databaseConfigured: false,
      message: "DATABASE_URL is not configured. This deployment is running in demo/local portfolio mode.",
      note: "Real database-backed features require DATABASE_URL. Real Nmap scanning requires local execution on Omega.",
    });
  }

  return Response.json({
    ok: true,
    databaseConfigured: true,
    message: "DATABASE_URL is configured.",
  });
}
