import { NextResponse } from "next/server";
import type { MusicSearchResponse } from "@/lib/music-types";
import {
  isSpotifySearchConfigured,
  searchSpotifyTracks,
  SpotifyServiceError,
} from "@/lib/spotify";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, max-age=0, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

function json(
  payload: MusicSearchResponse,
  status = 200,
  retryAfterSeconds?: number,
) {
  const headers: Record<string, string> = { ...NO_STORE_HEADERS };
  if (retryAfterSeconds) {
    headers["Retry-After"] = String(retryAfterSeconds);
  }

  return NextResponse.json(payload, { status, headers });
}

export async function GET(request: Request) {
  if (!isSpotifySearchConfigured()) {
    return json(
      {
        configured: false,
        tracks: [],
        error: "Spotify search is not configured",
      },
      503,
    );
  }

  const query = new URL(request.url).searchParams.get("q") ?? "";

  try {
    const tracks = await searchSpotifyTracks(query);
    return json({ configured: true, tracks });
  } catch (error) {
    if (error instanceof SpotifyServiceError) {
      return json(
        {
          configured: error.configured,
          tracks: [],
          error: error.message,
        },
        error.status,
        error.retryAfterSeconds,
      );
    }

    return json(
      {
        configured: true,
        tracks: [],
        error: "Spotify search is temporarily unavailable",
      },
      502,
    );
  }
}
