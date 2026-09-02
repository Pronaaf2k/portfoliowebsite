import { NextResponse } from "next/server";
import { getArcadeLeaderboard } from "@/lib/arcade-leaderboard";
import type { ArcadeGame, ArcadePeriod } from "@/lib/arcade-types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const game = params.get("game") as ArcadeGame;
  const period: ArcadePeriod = params.get("period") === "alltime" ? "alltime" : "weekly";
  try {
    if (!["reaction", "recoil", "spike", "snake", "breakout"].includes(game)) throw new Error("Invalid game");
    return NextResponse.json(await getArcadeLeaderboard(game, period), { headers: { "Cache-Control": "no-store, max-age=0" } });
  } catch {
    return NextResponse.json({ configured: false, game, period, label: "unavailable", entries: [] }, { status: 503, headers: { "Cache-Control": "no-store, max-age=0" } });
  }
}
