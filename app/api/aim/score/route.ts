import { NextResponse } from "next/server";
import {
  AimGameError,
  submitAimScore,
} from "@/lib/aim-leaderboard";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      sessionId?: unknown;
      name?: unknown;
      hits?: unknown;
      misses?: unknown;
    };
    const score = await submitAimScore(request, body);

    return NextResponse.json(score, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch (error) {
    const status = error instanceof AimGameError ? error.status : 500;
    const message =
      error instanceof AimGameError ? error.message : "Could not submit this score";

    return NextResponse.json(
      { accepted: false, error: message },
      {
        status,
        headers: { "Cache-Control": "no-store, max-age=0" },
      },
    );
  }
}
