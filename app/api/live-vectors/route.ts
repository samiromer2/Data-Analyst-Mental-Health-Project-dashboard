import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MODEL_API_URL = process.env.LIVE_MODEL_API_URL ?? "http://localhost:8000";

export async function GET() {
  try {
    const res = await fetch(`${MODEL_API_URL}/vectors`, { cache: "no-store" });
    if (!res.ok) {
      return NextResponse.json({ available: false, vectors: [] });
    }
    const vectors = await res.json();
    return NextResponse.json({ available: true, vectors });
  } catch {
    return NextResponse.json({ available: false, vectors: [] });
  }
}
