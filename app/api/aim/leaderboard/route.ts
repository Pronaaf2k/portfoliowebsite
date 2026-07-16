import { NextResponse } from "next/server";
import { getAimLeaderboard } from "@/lib/aim-leaderboard";
import type { AimPeriod } from "@/lib/aim-types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requested = new URL(request.url).searchParams.get("period");
  const period: AimPeriod = requested === "alltime" ? "alltime" : "weekly";

  try {
    const leaderboard = await getAimLeaderboard(period);
    return NextResponse.json(leaderboard, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch {
    return NextResponse.json(
      {
        configured: false,
        period,
        label: "unavailable",
        entries: [],
      },
      {
        status: 503,
        headers: { "Cache-Control": "no-store, max-age=0" },
      },
    );
  }
}
