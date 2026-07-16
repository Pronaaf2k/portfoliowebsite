import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
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

function htmlResponse(title: string, message: string, status = 200) {
  const safeTitle = title.replace(/[<>&"']/g, "");
  const safeMessage = message.replace(/[<>&"']/g, "");
  return new NextResponse(
    `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${safeTitle}</title><style>body{margin:0;background:#090b0d;color:#f0eee8;font:16px system-ui;display:grid;min-height:100vh;place-items:center}main{width:min(520px,calc(100% - 40px));border:1px solid #475159;padding:32px}h1{margin:0 0 14px;font-size:28px}p{margin:0;color:#aeb8bd;line-height:1.6}a{display:inline-block;margin-top:24px;color:#63d8e8}</style><main><h1>${safeTitle}</h1><p>${safeMessage}</p><a href="/">Return to portfolio</a></main></html>`,
    { status, headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
}

async function saveRefreshToken(refreshToken: string) {
  if (/\r|\n/.test(refreshToken)) throw new Error("Invalid refresh token");

  const envPath = join(process.cwd(), ".env.local");
  let contents = "";
  try {
    contents = await readFile(envPath, "utf8");
  } catch {
    // The local setup flow can create the ignored env file when it is absent.
  }

  const line = "SPOTIFY_REFRESH_TOKEN=" + refreshToken;
  if (/^SPOTIFY_REFRESH_TOKEN=.*$/m.test(contents)) {
    contents = contents.replace(/^SPOTIFY_REFRESH_TOKEN=.*$/m, line);
  } else {
    contents = contents.trimEnd() + "\n" + line + "\n";
  }
  await writeFile(envPath, contents, "utf8");
}

export async function GET(request: NextRequest) {
  if (!isLocalDevelopment(request)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const expectedState = request.cookies.get("spotify_oauth_state")?.value;
  const state = request.nextUrl.searchParams.get("state");
  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");

  if (error) return htmlResponse("Spotify not connected", error, 400);
  if (!code || !state || !expectedState || state !== expectedState) {
    return htmlResponse("Spotify not connected", "The authorization state did not match.", 400);
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return htmlResponse("Spotify not connected", "The local Spotify app credentials are missing.", 503);
  }

  const redirectUri = process.env.SPOTIFY_REDIRECT_URI ?? DEFAULT_REDIRECT_URI;
  const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization:
        "Basic " + Buffer.from(clientId + ":" + clientSecret).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
    cache: "no-store",
  });

  const tokenPayload = (await tokenResponse.json()) as {
    refresh_token?: string;
    error_description?: string;
  };
  if (!tokenResponse.ok || !tokenPayload.refresh_token) {
    return htmlResponse(
      "Spotify not connected",
      tokenPayload.error_description ?? "Spotify did not return a refresh token.",
      502,
    );
  }

  await saveRefreshToken(tokenPayload.refresh_token);
  const response = htmlResponse(
    "Spotify connected",
    "The private refresh token was saved locally. The live card can now read your current track.",
  );
  response.cookies.delete("spotify_oauth_state");
  return response;
}
