import { NextRequest, NextResponse } from "next/server";
import { getMeta } from "@/lib/query";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const dataset = request.nextUrl.searchParams.get("dataset") ?? undefined;
  const meta = await getMeta(dataset);
  return NextResponse.json(meta);
}
