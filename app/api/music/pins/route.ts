import { NextResponse } from "next/server";
import {
  isMusicPinboardConfigured,
  listPublicMusicPins,
} from "@/lib/music-inbox";
import type { MusicPinsResponse } from "@/lib/music-types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, max-age=0, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

function json(payload: MusicPinsResponse, status = 200) {
  return NextResponse.json(payload, {
    status,
    headers: NO_STORE_HEADERS,
  });
}

export async function GET() {
  if (!isMusicPinboardConfigured()) {
    return json({ configured: false, pins: [] });
  }

  try {
    const pins = await listPublicMusicPins();
    return json({ configured: true, pins });
  } catch {
    return json(
      {
        configured: true,
        pins: [],
        error: "The public listening queue is temporarily unavailable",
      },
      503,
    );
  }
}