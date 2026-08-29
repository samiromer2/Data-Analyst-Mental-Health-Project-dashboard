import { NextRequest, NextResponse } from "next/server";
import { parseFilters } from "@/lib/filters";
import { getInsights } from "@/lib/query";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const filters = parseFilters(Object.fromEntries(request.nextUrl.searchParams));
  const insights = await getInsights(filters);
  return NextResponse.json({ insights });
}
