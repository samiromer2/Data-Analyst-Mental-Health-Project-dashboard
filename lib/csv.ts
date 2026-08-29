import type { Observation } from "./types";

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }
    if (char === '"') {
      inQuotes = true;
      continue;
    }
    if (char === ",") {
      row.push(field);
      field = "";
      continue;
    }
    if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      continue;
    }
    if (char === "\r") continue;
    field += char;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((item) => item.some((cell) => cell.trim() !== ""));
}

function normHeader(header: string) {
  return header
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .replace(/[()]/g, "")
    .replace(/[\s\/-]+/g, "_");
}

function pick(row: Record<string, string>, keys: string[]) {
  for (const key of keys) {
    if (row[key] != null && row[key] !== "") return row[key];
  }
  return "";
}

function toNumber(value: string) {
  if (!value || value === "..") return null;
  const parsed = Number(value.replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

export function rowsFromCsv(text: string, dataset: string): Observation[] {
  const table = parseCsv(text.replace(/^\uFEFF/, ""));
  if (table.length < 2) return [];

  const headers = table[0].map(normHeader);
  const observations: Observation[] = [];

  for (const cells of table.slice(1)) {
    const raw: Record<string, string> = {};
    headers.forEach((header, index) => {
      raw[header] = (cells[index] ?? "").trim();
    });

    const indicator = pick(raw, ["indicator", "indicators"]);
    const value = toNumber(pick(raw, ["value"]));

    observations.push({
      dataset,
      ref_date: pick(raw, ["ref_date", "fiscal_year"]),
      geo: pick(raw, ["geo", "geography"]),
      age_group: pick(raw, ["age_group", "age"]),
      sex: pick(raw, ["sex", "gender", "group"]),
      indicator,
      characteristic: pick(raw, [
        "characteristic",
        "characteristics",
        "statistics",
        "breakdown",
      ]),
      uom: pick(raw, ["uom"]),
      value,
      status: pick(raw, ["status"]),
    });
  }

  return observations;
}
