import fs from "fs";

export function getNmapPath() {
  const envPath = process.env.NMAP_PATH
    ? process.env.NMAP_PATH.replaceAll('"', "").trim()
    : "";

  const candidates = [
    envPath,
    "C:\\Program Files (x86)\\Nmap\\nmap.exe",
    "C:\\Program Files\\Nmap\\nmap.exe",
    "nmap",
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (candidate === "nmap") return candidate;
    if (fs.existsSync(candidate)) return candidate;
  }

  return "nmap";
}
