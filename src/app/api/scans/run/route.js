export const runtime = "nodejs";

import { buildValidatedNmapArgs } from "@/lib/scanValidator";
import { startNmapJob } from "@/lib/scanJobs";

export async function POST(request) {
  try {
    const payload = await request.json();
    const validation = buildValidatedNmapArgs(payload);

    if (!validation.ok) {
      return Response.json(
        {
          status: "failed",
          error: validation.error,
        },
        {
          status: 400,
        }
      );
    }

    const job = startNmapJob({
      payload,
      validation,
    });

    return Response.json(
      {
        status: "running",
        jobId: job.id,
        job,
      },
      {
        status: 202,
      }
    );
  } catch (error) {
    return Response.json(
      {
        status: "failed",
        error: error?.message || "Could not start scan.",
      },
      {
        status: 500,
      }
    );
  }
}
