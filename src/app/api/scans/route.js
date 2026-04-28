export const runtime = "nodejs";

import { readScans } from "@/lib/scanStore";

export async function GET() {
  const scans = await readScans();
  return Response.json({ scans });
}
