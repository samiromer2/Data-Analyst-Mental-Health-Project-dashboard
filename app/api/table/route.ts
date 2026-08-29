import { NextRequest, NextResponse } from "next/server";
import { parseFilters } from "@/lib/filters";
import { getTable } from "@/lib/query";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const params = Object.fromEntries(request.nextUrl.searchParams);
  const filters = parseFilters(params);
  const limit = Number(params.limit ?? 50);
  const offset = Number(params.offset ?? 0);
  const table = await getTable(filters, limit, offset);
  return NextResponse.json(table);
}
