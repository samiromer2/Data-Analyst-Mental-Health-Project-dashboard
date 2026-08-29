import { NextRequest, NextResponse } from "next/server";
import { parseFilters } from "@/lib/filters";
import { getMetrics } from "@/lib/query";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const filters = parseFilters(Object.fromEntries(request.nextUrl.searchParams));
  const metrics = await getMetrics(filters);
  return NextResponse.json({ metrics });
}
