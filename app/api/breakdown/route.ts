import { NextRequest, NextResponse } from "next/server";
import { parseFilters } from "@/lib/filters";
import { getBreakdown } from "@/lib/query";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const params = Object.fromEntries(request.nextUrl.searchParams);
  const filters = parseFilters(params);
  const dimension = params.dimension;
  if (dimension !== "geo" && dimension !== "age" && dimension !== "sex") {
    return NextResponse.json({ error: "dimension must be geo, age, or sex" }, { status: 400 });
  }
  const points = await getBreakdown({ ...filters, dimension });
  return NextResponse.json({ points });
}
