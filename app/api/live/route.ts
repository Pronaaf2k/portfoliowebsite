import { NextResponse } from "next/server";
import type { LivePayload } from "@/lib/live-types";

export const dynamic = "force-dynamic";

const githubFallback: LivePayload["github"] = {
  state: "snapshot",
  title: "Pronaaf2k",
  detail: "Public activity is temporarily rate-limited",
  meta: "GitHub profile ready",
  href: "https://github.com/Pronaaf2k",
};

const steamFallback: LivePayload["steam"] = {
  state: "snapshot",
  title: "Off the clock",
  detail: "Steam profile snapshot",
  meta: "Steam presence ready to connect",
  href: "https://steamcommunity.com/id/Samiyeel/",
};

const spotifyFallback: LivePayload["spotify"] = {
  state: "offline",
  title: "Listening offline",
  detail: "No current track signal",
  meta: "Spotify account not connected",
  href: "#music-exchange",
};

type GithubEvent = {
  type?: string;
  created_at?: string;
  repo?: { name?: string };
  payload?: {
    commits?: Array<{ message?: string; sha?: string }>;
  };
};

async function getGithub(): Promise<LivePayload["github"]> {
  try {
    const headers: HeadersInit = {
      Accept: "application/vnd.github+json",
      "User-Agent": "samiyeel-portfolio",
    };

    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = "Bearer " + process.env.GITHUB_TOKEN;
    }

    const response = await fetch(
      "https://api.github.com/users/Pronaaf2k/events/public?per_page=20",
      {
        headers,
        next: { revalidate: 300 },
      },
    );

    if (!response.ok) return githubFallback;

    const events = (await response.json()) as GithubEvent[];
    const push = events.find(
      (event) => event.type === "PushEvent" && event.payload?.commits?.length,
    );
    const event = push ?? events[0];

    if (!event) return githubFallback;

    const fullRepoName = event.repo?.name;
    const repoName = fullRepoName?.split("/").at(-1) ?? "Public GitHub";
    const eventCommit = event.payload?.commits?.at(-1);
    let message = eventCommit?.message?.split("\n")[0];
    let href = "https://github.com/" + (fullRepoName ?? "Pronaaf2k");

    if (!message && event.type === "PushEvent" && fullRepoName) {
      const commitResponse = await fetch(
        "https://api.github.com/repos/" + fullRepoName + "/commits?per_page=1",
        { headers, next: { revalidate: 300 } },
      );

      if (commitResponse.ok) {
        const [latest] = (await commitResponse.json()) as Array<{
          commit?: { message?: string };
          html_url?: string;
        }>;
        message = latest?.commit?.message?.split("\n")[0];
        href = latest?.html_url ?? href;
      }
    }

    const elapsedHours = event.created_at
      ? Math.max(
          1,
          Math.round((Date.now() - new Date(event.created_at).getTime()) / 3_600_000),
        )
      : 0;
    const age = elapsedHours
      ? new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
          elapsedHours >= 48 ? -Math.round(elapsedHours / 24) : -elapsedHours,
          elapsedHours >= 48 ? "day" : "hour",
        )
      : "recently";

    return {
      state: "live",
      title: repoName,
      detail:
        message ??
        (event.type ? event.type.replace("Event", "") + " activity" : "Public activity"),
      meta: "Updated " + age,
      href,
    };
  } catch {
    return githubFallback;
  }
}

async function getSteam(): Promise<LivePayload["steam"]> {
  const key = process.env.STEAM_API_KEY;
  const steamId = process.env.STEAM_ID;

  if (!key || !steamId) return steamFallback;

  try {
    const response = await fetch(
      "https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=" +
        encodeURIComponent(key) +
        "&steamids=" +
        encodeURIComponent(steamId),
      { next: { revalidate: 60 } },
    );

    if (!response.ok) return steamFallback;

    const payload = (await response.json()) as {
      response?: {
        players?: Array<{
          personaname?: string;
          personastate?: number;
          gameextrainfo?: string;
          lastlogoff?: number;
        }>;
      };
    };
    const player = payload.response?.players?.[0];
    if (!player) return steamFallback;

    const stateNames = ["Offline", "Online", "Busy", "Away", "Snooze", "Trading", "Looking to play"];
    const presence = stateNames[player.personastate ?? 0] ?? "Online";

    return {
      state: "live",
      title: player.gameextrainfo ?? presence,
      detail: player.gameextrainfo ? "Currently in game" : player.personaname ?? "Pronaaf2k",
      meta: "Steam presence / " + presence,
      href: "https://steamcommunity.com/id/Samiyeel/",
    };
  } catch {
    return steamFallback;
  }
}

async function getSpotify(): Promise<LivePayload["spotify"]> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) return spotifyFallback;

  try {
    const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization:
          "Basic " + Buffer.from(clientId + ":" + clientSecret).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
      cache: "no-store",
    });

    if (!tokenResponse.ok) return spotifyFallback;

    const tokenPayload = (await tokenResponse.json()) as { access_token?: string };
    if (!tokenPayload.access_token) return spotifyFallback;

    const playingResponse = await fetch(
      "https://api.spotify.com/v1/me/player/currently-playing",
      {
        headers: { Authorization: "Bearer " + tokenPayload.access_token },
        cache: "no-store",
      },
    );

    if (playingResponse.status === 204) {
      return {
        state: "offline",
        title: "Between tracks",
        detail: "Spotify is connected",
        meta: "Nothing playing right now",
        href: "https://open.spotify.com/",
        refreshAfterMs: 30_000,
      };
    }

    if (!playingResponse.ok) return spotifyFallback;

    const playing = (await playingResponse.json()) as {
      is_playing?: boolean;
      progress_ms?: number;
      item?: {
        name?: string;
        duration_ms?: number;
        external_urls?: { spotify?: string };
        artists?: Array<{ name?: string }>;
      };
    };
    const track = playing.item;

    if (!track) return spotifyFallback;

    const remainingMs =
      typeof track.duration_ms === "number" &&
      typeof playing.progress_ms === "number"
        ? track.duration_ms - playing.progress_ms
        : null;

    return {
      state: playing.is_playing ? "live" : "snapshot",
      title: track.name ?? "Now playing",
      detail: track.artists?.map((artist) => artist.name).filter(Boolean).join(", ") ?? "Spotify",
      meta: playing.is_playing ? "Playing now" : "Recently paused",
      href: track.external_urls?.spotify ?? "https://open.spotify.com/",
      refreshAfterMs:
        playing.is_playing && remainingMs && remainingMs > 0
          ? Math.max(5_000, remainingMs + 2_000)
          : 30_000,
    };
  } catch {
    return spotifyFallback;
  }
}

export async function GET() {
  const [github, steam, spotify] = await Promise.all([
    getGithub(),
    getSteam(),
    getSpotify(),
  ]);

  return NextResponse.json(
    {
      generatedAt: new Date().toISOString(),
      github,
      steam,
      spotify,
    } satisfies LivePayload,
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}
