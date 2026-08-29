import { promises as fs } from "fs";
import path from "path";
import { DATASET_REGISTRY, getDataset } from "./datasets";
import { rowsFromCsv } from "./csv";
import type { Observation } from "./types";

const processedDir = path.join(process.cwd(), "data", "processed");
const cache = new Map<string, Observation[] | null>();

export async function listProcessedFiles() {
  try {
    const entries = await fs.readdir(processedDir);
    return entries.filter((name) => name.endsWith(".csv"));
  } catch {
    return [];
  }
}

export async function loadDataset(id: string): Promise<Observation[]> {
  const cached = cache.get(id);
  if (cached && cached.length > 0) return cached;

  const config = getDataset(id);
  const filePath = path.join(processedDir, config.file);

  try {
    const text = await fs.readFile(filePath, "utf8");
    const rows = rowsFromCsv(text, config.id);
    if (rows.length > 0) cache.set(id, rows);
    return rows;
  } catch {
    return [];
  }
}

export async function datasetPresence() {
  const files = await listProcessedFiles();
  const present = DATASET_REGISTRY.filter((item) => files.includes(item.file)).map(
    (item) => item.file,
  );
  const missing = DATASET_REGISTRY.filter((item) => !files.includes(item.file)).map(
    (item) => item.file,
  );
  return { present, missing, files };
}

export function isPublishable(row: Observation) {
  const status = row.status.trim().toUpperCase();
  if (status === "F" || status === "X") return false;
  return row.value != null;
}

export function isPercent(row: Observation) {
  const characteristic = row.characteristic.toLowerCase();
  const uom = row.uom.toLowerCase();
  if (!characteristic && !uom) return true;
  return characteristic.includes("percent") || uom.includes("percent");
}
