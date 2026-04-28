export const runtime = "nodejs";

import { spawn } from "child_process";
import { getNmapPath } from "@/lib/nmapPath";

export async function GET() {
  const nmapPath = getNmapPath();

  const result = await new Promise((resolve) => {
    const nmap = spawn(nmapPath, ["--version"], { windowsHide: true });

    let output = "";
    let errorOutput = "";

    nmap.stdout.on("data", (data) => {
      output += data.toString();
    });

    nmap.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    nmap.on("error", (error) => {
      resolve({
        installed: false,
        path: nmapPath,
        message: error.message || "Nmap is not installed or not found.",
      });
    });

    nmap.on("close", (code) => {
      if (code === 0) {
        resolve({
          installed: true,
          path: nmapPath,
          version: output.split("\n")[0] || "Nmap detected",
        });
      } else {
        resolve({
          installed: false,
          path: nmapPath,
          message: errorOutput || `Nmap exited with code ${code}.`,
        });
      }
    });
  });

  return Response.json(result);
}
