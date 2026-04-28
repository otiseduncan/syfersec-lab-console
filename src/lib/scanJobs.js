import { spawn } from "child_process";
import { getNmapPath } from "@/lib/nmapPath";
import { parseNmapXml, generateFindings } from "@/lib/parseNmapXml";
import { saveScan } from "@/lib/scanStore";
import { scanPolicy } from "@/lib/scanPolicy";

const globalForJobs = globalThis;

if (!globalForJobs.syfersecScanJobs) {
  globalForJobs.syfersecScanJobs = new Map();
}

const jobs = globalForJobs.syfersecScanJobs;

function estimateProgressFromText(text) {
  const percentMatch = text.match(/About\s+([0-9.]+)%\s+done/i);

  if (percentMatch) {
    const percent = Number(percentMatch[1]);

    if (!Number.isNaN(percent)) {
      return Math.max(1, Math.min(99, Math.round(percent)));
    }
  }

  return null;
}

export function getJob(jobId) {
  return jobs.get(jobId) || null;
}

export function startNmapJob({ payload, validation }) {
  const jobId = `job-${Date.now()}`;
  const startedAtMs = Date.now();
  const startedAt = new Date().toISOString();
  const nmapPath = getNmapPath();

  const job = {
    id: jobId,
    status: "running",
    phase: "Starting Nmap",
    progress: 1,
    startedAt,
    completedAt: null,
    durationMs: 0,
    target: payload.target,
    modeId: payload.modeId,
    modeName: validation.mode.name,
    safeCommandPreview: validation.safeCommandPreview,
    liveOutput: "",
    error: "",
    scan: null,
  };

  jobs.set(jobId, job);

  const nmapArgs = ["--stats-every", "5s", ...validation.args];

  const nmap = spawn(nmapPath, nmapArgs, {
    windowsHide: true,
  });

  let stdout = "";
  let stderr = "";
  let settled = false;

  const updateTimer = setInterval(() => {
    const current = jobs.get(jobId);
    if (!current || current.status !== "running") return;

    const elapsed = Date.now() - startedAtMs;
    const timeoutMs = scanPolicy.defaultTimeoutSeconds * 1000;
    const estimated = Math.min(95, Math.max(1, Math.round((elapsed / timeoutMs) * 95)));

    current.durationMs = elapsed;
    current.progress = Math.max(current.progress, estimated);
    current.phase = "Scanning";
    jobs.set(jobId, current);
  }, 1000);

  const timeout = setTimeout(() => {
    if (!settled) {
      settled = true;
      clearInterval(updateTimer);
      nmap.kill();

      const current = jobs.get(jobId);

      if (current) {
        current.status = "failed";
        current.phase = "Timed out";
        current.progress = 100;
        current.completedAt = new Date().toISOString();
        current.durationMs = Date.now() - startedAtMs;
        current.error = "Scan timed out.";
        jobs.set(jobId, current);
      }
    }
  }, scanPolicy.defaultTimeoutSeconds * 1000);

  function handleOutput(chunk) {
    const text = chunk.toString();
    const current = jobs.get(jobId);
    if (!current) return;

    current.liveOutput = (current.liveOutput + text).slice(-12000);

    const parsedProgress = estimateProgressFromText(current.liveOutput);

    if (parsedProgress !== null) {
      current.progress = Math.max(current.progress, parsedProgress);
    }

    current.durationMs = Date.now() - startedAtMs;
    current.phase = "Scanning";
    jobs.set(jobId, current);
  }

  nmap.stdout.on("data", (data) => {
    stdout += data.toString();
    handleOutput(data);
  });

  nmap.stderr.on("data", (data) => {
    stderr += data.toString();
    handleOutput(data);
  });

  nmap.on("error", (error) => {
    if (settled) return;

    settled = true;
    clearInterval(updateTimer);
    clearTimeout(timeout);

    const current = jobs.get(jobId);

    if (current) {
      current.status = "failed";
      current.phase = "Failed";
      current.progress = 100;
      current.completedAt = new Date().toISOString();
      current.durationMs = Date.now() - startedAtMs;
      current.error = error.message || "Failed to start Nmap.";
      jobs.set(jobId, current);
    }
  });

  nmap.on("close", async (code) => {
    if (settled) return;

    settled = true;
    clearInterval(updateTimer);
    clearTimeout(timeout);

    const current = jobs.get(jobId);
    if (!current) return;

    current.completedAt = new Date().toISOString();
    current.durationMs = Date.now() - startedAtMs;

    if (code !== 0) {
      current.status = "failed";
      current.phase = "Failed";
      current.progress = 100;
      current.error = stderr || `Nmap exited with code ${code}.`;
      jobs.set(jobId, current);
      return;
    }

    try {
      current.phase = "Parsing results";
      current.progress = 96;
      jobs.set(jobId, current);

      const parsed = parseNmapXml(stdout);
      const findings = generateFindings(parsed);

      const scan = {
        id: `scan-${Date.now()}`,
        target: payload.target,
        modeId: payload.modeId,
        modeName: validation.mode.name,
        args: validation.args,
        safeCommandPreview: validation.safeCommandPreview,
        status: "completed",
        startedAt,
        completedAt: current.completedAt,
        durationMs: current.durationMs,
        rawOutput: stdout,
        stderr,
        parsed,
        findings,
        notes: payload.notes || "",
      };

      await saveScan(scan);

      current.status = "completed";
      current.phase = "Completed";
      current.progress = 100;
      current.scan = scan;
      jobs.set(jobId, current);
    } catch (error) {
      current.status = "failed";
      current.phase = "Parse failed";
      current.progress = 100;
      current.error = error.message || "Could not parse Nmap XML output.";
      current.liveOutput = (current.liveOutput + "\n" + stdout + "\n" + stderr).slice(-12000);
      jobs.set(jobId, current);
    }
  });

  return job;
}
