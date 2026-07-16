import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const DEFAULT_REDIRECT_URI =
  "http://127.0.0.1:3000/api/spotify/callback";

function isLocalDevelopment(request: NextRequest) {
  return (
    process.env.NODE_ENV !== "production" &&
    ["127.0.0.1", "localhost"].includes(request.nextUrl.hostname)
  );
}

export async function GET(request: NextRequest) {
  if (!isLocalDevelopment(request)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { error: "Spotify client ID is not configured" },
      { status: 503 },
    );
  }

  const state = randomBytes(24).toString("hex");
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI ?? DEFAULT_REDIRECT_URI;
  const authorizeUrl = new URL("https://accounts.spotify.com/authorize");
  authorizeUrl.search = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    scope: "user-read-currently-playing",
    state,
    show_dialog: "true",
  }).toString();

  const response = NextResponse.redirect(authorizeUrl);
  response.cookies.set("spotify_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 10 * 60,
    path: "/api/spotify",
  });
  return response;
}
