import { NextResponse } from "next/server";
import { ArcadeGameError, submitArcadeScore } from "@/lib/arcade-leaderboard";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { game?: unknown; name?: unknown; score?: unknown; detail?: unknown };
    return NextResponse.json(await submitArcadeScore(request, body), { headers: { "Cache-Control": "no-store, max-age=0" } });
  } catch (error) {
    const status = error instanceof ArcadeGameError ? error.status : 500;
    const message = error instanceof ArcadeGameError ? error.message : "Could not submit this score";
    return NextResponse.json({ accepted: false, error: message }, { status, headers: { "Cache-Control": "no-store, max-age=0" } });
  }
}
