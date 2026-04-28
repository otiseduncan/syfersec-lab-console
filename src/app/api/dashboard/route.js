export const runtime = "nodejs";

export async function GET() {
  const hasDatabase = Boolean(process.env.DATABASE_URL);

  return Response.json({
    ok: true,
    databaseConfigured: hasDatabase,
    message: hasDatabase
      ? "Database connection is configured."
      : "DATABASE_URL is not configured. Running in local/demo dashboard mode.",
    dashboard: {
      app: "SyferSec Lab Console",
      mode: hasDatabase ? "database" : "local-demo",
      scanner: "local-only",
      note: "Real Nmap scanning requires the app to run locally on the machine where Nmap is installed.",
    },
  });
}
