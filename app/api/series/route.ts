import { NextRequest, NextResponse } from "next/server";
import { parseFilters } from "@/lib/filters";
import { getSeries } from "@/lib/query";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const filters = parseFilters(Object.fromEntries(request.nextUrl.searchParams));
  const points = await getSeries(filters);
  return NextResponse.json({ points });
}
