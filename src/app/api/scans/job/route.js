export const runtime = "nodejs";

import { getJob } from "@/lib/scanJobs";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get("id");

  if (!jobId) {
    return Response.json(
      {
        error: "Missing job id.",
      },
      {
        status: 400,
      }
    );
  }

  const job = getJob(jobId);

  if (!job) {
    return Response.json(
      {
        error: "Scan job not found. The dev server may have restarted.",
      },
      {
        status: 404,
      }
    );
  }

  return Response.json({
    job,
  });
}
