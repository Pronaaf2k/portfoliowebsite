import { NextResponse } from "next/server";
import {
  AimGameError,
  createAimSession,
} from "@/lib/aim-leaderboard";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const session = await createAimSession(request);

    return NextResponse.json(session, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch (error) {
    const status = error instanceof AimGameError ? error.status : 500;
    const message =
      error instanceof AimGameError ? error.message : "Could not start an online game";

    return NextResponse.json(
      { configured: status !== 503, error: message },
      {
        status,
        headers: { "Cache-Control": "no-store, max-age=0" },
      },
    );
  }
}
