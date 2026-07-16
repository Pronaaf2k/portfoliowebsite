import { NextResponse } from "next/server";
import type { MusicRandomResponse } from "@/lib/music-types";
import {
  getRandomSpotifyPlaylistTrack,
  isSpotifyPlaylistConfigured,
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
  payload: MusicRandomResponse,
  status = 200,
  retryAfterSeconds?: number,
) {
  const headers: Record<string, string> = { ...NO_STORE_HEADERS };
  if (retryAfterSeconds) {
    headers["Retry-After"] = String(retryAfterSeconds);
  }

  return NextResponse.json(payload, { status, headers });
}

export async function GET() {
  if (!isSpotifyPlaylistConfigured()) {
    return json(
      {
        configured: false,
        error: "Spotify playlists are not configured",
      },
      503,
    );
  }

  try {
    const selection = await getRandomSpotifyPlaylistTrack();
    return json({
      configured: true,
      track: selection.track,
      source: selection.source,
    });
  } catch (error) {
    if (error instanceof SpotifyServiceError) {
      return json(
        {
          configured: error.configured,
          error: error.message,
        },
        error.status,
        error.retryAfterSeconds,
      );
    }

    return json(
      {
        configured: true,
        error: "Spotify playlists are temporarily unavailable",
      },
      502,
    );
  }
}
