import { NextResponse } from "next/server";
import {
  recordAimHeartbeat,
  snapshotCompletedLeaderboards,
} from "@/lib/aim-leaderboard";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { archived: false, error: "Cron is not configured" },
      { status: 503 },
    );
  }

  if (request.headers.get("authorization") !== "Bearer " + secret) {
    return NextResponse.json(
      { archived: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const heartbeat = await recordAimHeartbeat();
    const snapshots = await snapshotCompletedLeaderboards();
    return NextResponse.json({ archived: true, heartbeat, snapshots });
  } catch {
    return NextResponse.json(
      { archived: false, error: "Heartbeat or leaderboard archive failed" },
      { status: 503 },
    );
  }
}
