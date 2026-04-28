import fs from "fs/promises";
import path from "path";

const dataDir = path.join(process.cwd(), "data");
const scansFile = path.join(dataDir, "scans.json");

async function ensureStore() {
  await fs.mkdir(dataDir, { recursive: true });

  try {
    await fs.access(scansFile);
  } catch {
    await fs.writeFile(scansFile, "[]", "utf8");
  }
}

export async function readScans() {
  await ensureStore();

  const raw = await fs.readFile(scansFile, "utf8");

  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function saveScan(scan) {
  const scans = await readScans();
  const nextScans = [scan, ...scans].slice(0, 100);

  await fs.writeFile(scansFile, JSON.stringify(nextScans, null, 2), "utf8");

  return scan;
}
