import { NextResponse } from "next/server";
import {
  isMusicInboxConfigured,
  MusicInboxError,
  submitMusicDrop,
} from "@/lib/music-inbox";
import type { MusicDropResponse } from "@/lib/music-types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_BODY_BYTES = 8_192;
const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, max-age=0, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

function json(
  payload: MusicDropResponse,
  status = 200,
  retryAfterSeconds?: number,
) {
  const headers: Record<string, string> = { ...NO_STORE_HEADERS };
  if (retryAfterSeconds) {
    headers["Retry-After"] = String(retryAfterSeconds);
  }

  return NextResponse.json(payload, { status, headers });
}

export async function POST(request: Request) {
  if (!isMusicInboxConfigured()) {
    return json(
      {
        accepted: false,
        configured: false,
        error: "Music exchange is not configured",
      },
      503,
    );
  }

  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return json(
      {
        accepted: false,
        configured: true,
        error: "Music drop is too large",
      },
      413,
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json(
      {
        accepted: false,
        configured: true,
        error: "Music drop must be valid JSON",
      },
      400,
    );
  }

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return json(
      {
        accepted: false,
        configured: true,
        error: "Music drop payload is invalid",
      },
      400,
    );
  }

  try {
    const result = await submitMusicDrop(request, body);
    return json(result, 201);
  } catch (error) {
    if (error instanceof MusicInboxError) {
      return json(
        {
          accepted: false,
          configured: error.configured,
          error: error.message,
          ...(error.retryAfterSeconds
            ? { retryAfterSeconds: error.retryAfterSeconds }
            : {}),
        },
        error.status,
        error.retryAfterSeconds,
      );
    }

    return json(
      {
        accepted: false,
        configured: true,
        error: "Music exchange inbox is temporarily unavailable",
      },
      503,
    );
  }
}
