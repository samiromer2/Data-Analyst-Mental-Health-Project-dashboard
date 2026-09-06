import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const MODEL_API_URL = process.env.LIVE_MODEL_API_URL ?? "http://localhost:8000";

export async function GET(request: NextRequest) {
  const vector = request.nextUrl.searchParams.get("vector");
  if (!vector) {
    return NextResponse.json({ error: "missing vector param" }, { status: 400 });
  }
  const vectorId = vector.replace(/^v/i, "");

  try {
    const res = await fetch(`${MODEL_API_URL}/live-predict/${vectorId}`, {
      cache: "no-store",
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: body.detail ?? "live model service unavailable" },
        { status: res.status },
      );
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Could not reach the live model service. Is api_service running on port 8000?" },
      { status: 503 },
    );
  }
}
