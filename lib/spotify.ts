import "server-only";

import { randomInt } from "node:crypto";
import type { MusicTrack } from "@/lib/music-types";

const SPOTIFY_ACCOUNTS_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_API_URL = "https://api.spotify.com/v1";
const TOKEN_EXPIRY_SKEW_MS = 30_000;
const PLAYLIST_PAGE_SIZE = 50;
const MAX_PLAYLIST_PAGES = 250;
const PLAYLIST_CACHE_TTL_MS = 5 * 60 * 1_000;
const SPOTIFY_ID_PATTERN = /^[A-Za-z0-9]{22}$/;

type TokenKind = "application" | "user";

type CachedToken = {
  accessToken: string;
  expiresAt: number;
};

type SpotifyTokenPayload = {
  access_token?: unknown;
  expires_in?: unknown;
};

let applicationToken: CachedToken | null = null;
let userToken: CachedToken | null = null;
let playlistTrackCache: {
  key: string;
  tracks: MusicTrack[];
  expiresAt: number;
} | null = null;

export class SpotifyServiceError extends Error {
  status: number;
  configured: boolean;
  retryAfterSeconds?: number;

  constructor(
    message: string,
    status: number,
    configured = true,
    retryAfterSeconds?: number,
  ) {
    super(message);
    this.name = "SpotifyServiceError";
    this.status = status;
    this.configured = configured;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function nonEmptyString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function safeHttpsUrl(value: unknown) {
  const candidate = nonEmptyString(value);
  if (!candidate) return null;

  try {
    const url = new URL(candidate);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function spotifyUrlForTrack(value: unknown, trackId: string) {
  const candidate = safeHttpsUrl(value);

  if (candidate) {
    try {
      const url = new URL(candidate);
      if (url.hostname === "open.spotify.com") return url.toString();
    } catch {
      // safeHttpsUrl already validated the URL; use the fallback below.
    }
  }

  return "https://open.spotify.com/track/" + trackId;
}

export function isSpotifyTrackId(value: unknown): value is string {
  return typeof value === "string" && SPOTIFY_ID_PATTERN.test(value);
}

export function mapSpotifyTrack(value: unknown): MusicTrack | null {
  if (!isRecord(value)) return null;
  if (value.type !== undefined && value.type !== "track") return null;
  if (value.is_local === true) return null;

  const id = nonEmptyString(value.id);
  const name = nonEmptyString(value.name);
  const albumPayload = isRecord(value.album) ? value.album : null;
  const album = albumPayload ? nonEmptyString(albumPayload.name) : null;
  const artistPayload = Array.isArray(value.artists) ? value.artists : [];
  const artists = artistPayload
    .map((artist) => (isRecord(artist) ? nonEmptyString(artist.name) : null))
    .filter((artist): artist is string => Boolean(artist));
  const durationMs = Number(value.duration_ms);

  if (
    !id ||
    !SPOTIFY_ID_PATTERN.test(id) ||
    !name ||
    !album ||
    !artists.length ||
    !Number.isFinite(durationMs) ||
    durationMs < 0
  ) {
    return null;
  }

  const images =
    albumPayload && Array.isArray(albumPayload.images)
      ? albumPayload.images
      : [];
  const imageUrl =
    images
      .map((image) => (isRecord(image) ? safeHttpsUrl(image.url) : null))
      .find((url): url is string => Boolean(url)) ?? null;
  const externalUrls = isRecord(value.external_urls)
    ? value.external_urls
    : null;

  return {
    id,
    name,
    artists: artists.join(", "),
    album,
    imageUrl,
    spotifyUrl: spotifyUrlForTrack(externalUrls?.spotify, id),
    durationMs: Math.round(durationMs),
  };
}

function getSpotifyCredentials() {
  const clientId = process.env.SPOTIFY_CLIENT_ID?.trim();
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret) {
    throw new SpotifyServiceError("Spotify is not configured", 503, false);
  }

  return { clientId, clientSecret };
}

function getPlaylistIds() {
  const raw = process.env.SPOTIFY_PLAYLIST_IDS;
  if (!raw) return [];

  return Array.from(
    new Set(
      raw
        .split(",")
        .map((id) => id.trim())
        .filter((id) => SPOTIFY_ID_PATTERN.test(id)),
    ),
  );
}

export function isSpotifySearchConfigured() {
  return Boolean(
    process.env.SPOTIFY_CLIENT_ID?.trim() &&
      process.env.SPOTIFY_CLIENT_SECRET?.trim(),
  );
}

export function isSpotifyPlaylistConfigured() {
  return Boolean(isSpotifySearchConfigured() && getPlaylistIds().length);
}

function getCachedToken(kind: TokenKind) {
  const cached = kind === "application" ? applicationToken : userToken;
  return cached && cached.expiresAt > Date.now() ? cached.accessToken : null;
}

function clearCachedToken(kind: TokenKind) {
  if (kind === "application") applicationToken = null;
  else userToken = null;
}

async function readJson(response: Response, failureMessage: string) {
  try {
    return (await response.json()) as unknown;
  } catch {
    throw new SpotifyServiceError(failureMessage, 502);
  }
}

function retryAfterSeconds(response: Response) {
  const value = Number(response.headers.get("retry-after"));
  return Number.isFinite(value) && value > 0 ? Math.ceil(value) : undefined;
}

function throwForSpotifyResponse(response: Response, message: string): never {
  if (response.status === 429) {
    throw new SpotifyServiceError(
      "Spotify is temporarily rate-limited",
      503,
      true,
      retryAfterSeconds(response),
    );
  }

  if (response.status === 401 || response.status === 403) {
    throw new SpotifyServiceError(message, 502);
  }

  if (response.status === 404) {
    throw new SpotifyServiceError(message, 404);
  }

  throw new SpotifyServiceError(message, 502);
}

async function requestAccessToken(kind: TokenKind, forceRefresh = false) {
  if (!forceRefresh) {
    const cached = getCachedToken(kind);
    if (cached) return cached;
  }

  const { clientId, clientSecret } = getSpotifyCredentials();
  const body = new URLSearchParams();

  if (kind === "application") {
    body.set("grant_type", "client_credentials");
  } else {
    const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN?.trim();
    if (!refreshToken) {
      throw new SpotifyServiceError(
        "Spotify playlists are not configured",
        503,
        false,
      );
    }

    body.set("grant_type", "refresh_token");
    body.set("refresh_token", refreshToken);
  }

  let response: Response;
  try {
    response = await fetch(SPOTIFY_ACCOUNTS_URL, {
      method: "POST",
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(clientId + ":" + clientSecret).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
      cache: "no-store",
    });
  } catch {
    throw new SpotifyServiceError("Spotify authorization is unavailable", 502);
  }

  if (!response.ok) {
    if (response.status === 429) {
      throwForSpotifyResponse(response, "Spotify authorization is unavailable");
    }

    throw new SpotifyServiceError(
      "Spotify credentials could not be verified",
      503,
      false,
    );
  }

  const payload = (await readJson(
    response,
    "Spotify authorization returned an invalid response",
  )) as SpotifyTokenPayload;
  const accessToken = nonEmptyString(payload.access_token);
  const expiresIn = Number(payload.expires_in);

  if (!accessToken) {
    throw new SpotifyServiceError(
      "Spotify authorization returned an invalid response",
      502,
    );
  }

  const lifetimeMs =
    Number.isFinite(expiresIn) && expiresIn > 0
      ? expiresIn * 1_000
      : 3_600_000;
  const cached = {
    accessToken,
    expiresAt:
      Date.now() + Math.max(1_000, lifetimeMs - TOKEN_EXPIRY_SKEW_MS),
  };

  if (kind === "application") applicationToken = cached;
  else userToken = cached;

  return accessToken;
}

async function spotifyFetch(path: string, kind: TokenKind) {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const accessToken = await requestAccessToken(kind, attempt > 0);
    let response: Response;

    try {
      response = await fetch(SPOTIFY_API_URL + path, {
        headers: {
          Authorization: "Bearer " + accessToken,
          Accept: "application/json",
        },
        cache: "no-store",
      });
    } catch {
      throw new SpotifyServiceError("Spotify is temporarily unavailable", 502);
    }

    if (response.status !== 401 || attempt === 1) return response;
    clearCachedToken(kind);
  }

  throw new SpotifyServiceError("Spotify authorization is unavailable", 502);
}

export async function searchSpotifyTracks(query: string, limit = 8) {
  const normalizedQuery = query
    .normalize("NFKC")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalizedQuery) {
    throw new SpotifyServiceError("Enter a song or artist to search", 400);
  }

  if (Array.from(normalizedQuery).length > 100) {
    throw new SpotifyServiceError("Search is limited to 100 characters", 400);
  }

  const requestedLimit = Number.isFinite(limit) ? Math.floor(limit) : 8;
  const safeLimit = Math.min(10, Math.max(1, requestedLimit));
  const parameters = new URLSearchParams({
    q: normalizedQuery,
    type: "track",
    limit: String(safeLimit),
  });
  const tokenKind: TokenKind = process.env.SPOTIFY_REFRESH_TOKEN?.trim()
    ? "user"
    : "application";
  const response = await spotifyFetch(
    "/search?" + parameters.toString(),
    tokenKind,
  );

  if (!response.ok) {
    console.error("Spotify search request failed", {
      status: response.status,
      tokenKind,
    });
    throwForSpotifyResponse(response, "Spotify search is unavailable");
  }

  const payload = await readJson(
    response,
    "Spotify search returned an invalid response",
  );
  const tracksPayload =
    isRecord(payload) && isRecord(payload.tracks) ? payload.tracks : null;
  const items =
    tracksPayload && Array.isArray(tracksPayload.items)
      ? tracksPayload.items
      : [];

  return items
    .map(mapSpotifyTrack)
    .filter((track): track is MusicTrack => Boolean(track));
}

export async function getSpotifyTrack(trackId: string) {
  if (!isSpotifyTrackId(trackId)) {
    throw new SpotifyServiceError("Choose a valid Spotify track", 400);
  }

  const response = await spotifyFetch(
    "/tracks/" + encodeURIComponent(trackId),
    "application",
  );

  if (!response.ok) {
    throwForSpotifyResponse(response, "Spotify track could not be verified");
  }

  const payload = await readJson(
    response,
    "Spotify track returned an invalid response",
  );
  const track = mapSpotifyTrack(payload);

  if (!track) {
    throw new SpotifyServiceError(
      "Spotify track returned an invalid response",
      502,
    );
  }

  return track;
}

function mapPlaylistItem(value: unknown) {
  if (!isRecord(value) || value.is_local === true) return null;

  // Spotify's current response uses `item`; older responses used `track`.
  return mapSpotifyTrack(value.item ?? value.track);
}

async function getPlaylistTracks(playlistId: string, tokenKind: TokenKind) {
  const tracks: MusicTrack[] = [];
  let offset = 0;

  for (let pageNumber = 0; pageNumber < MAX_PLAYLIST_PAGES; pageNumber += 1) {
    const parameters = new URLSearchParams({
      limit: String(PLAYLIST_PAGE_SIZE),
      offset: String(offset),
    });
    const response = await spotifyFetch(
      "/playlists/" +
        encodeURIComponent(playlistId) +
        "/items?" +
        parameters.toString(),
      tokenKind,
    );

    if (response.status === 403 || response.status === 404) {
      throw new SpotifyServiceError("Spotify playlist could not be read", 404);
    }

    if (!response.ok) {
      throwForSpotifyResponse(response, "Spotify playlist could not be read");
    }

    const payload = await readJson(
      response,
      "Spotify playlist returned an invalid response",
    );
    if (!isRecord(payload)) {
      throw new SpotifyServiceError(
        "Spotify playlist returned an invalid response",
        502,
      );
    }

    const items = Array.isArray(payload.items) ? payload.items : [];
    for (const item of items) {
      const track = mapPlaylistItem(item);
      if (track) tracks.push(track);
    }

    const total = Number(payload.total);
    offset += items.length;
    const hasKnownRemainder = Number.isFinite(total) && offset < total;
    const hasNextPage =
      typeof payload.next === "string" && Boolean(payload.next);

    if (!items.length || (!hasKnownRemainder && !hasNextPage)) break;
  }

  return tracks;
}

async function getConfiguredPlaylistTracks(
  playlistIds: string[],
  tokenKind: TokenKind,
) {
  const cacheKey = tokenKind + ":" + playlistIds.join(",");
  if (
    playlistTrackCache?.key === cacheKey &&
    playlistTrackCache.expiresAt > Date.now()
  ) {
    return { tracks: playlistTrackCache.tracks, inaccessiblePlaylists: 0 };
  }

  const results = await Promise.allSettled(
    playlistIds.map((playlistId) => getPlaylistTracks(playlistId, tokenKind)),
  );
  const tracks: MusicTrack[] = [];
  let inaccessiblePlaylists = 0;

  for (const result of results) {
    if (result.status === "fulfilled") {
      tracks.push(...result.value);
      continue;
    }

    if (
      result.reason instanceof SpotifyServiceError &&
      result.reason.status === 404
    ) {
      inaccessiblePlaylists += 1;
      continue;
    }

    throw result.reason;
  }

  if (tracks.length) {
    playlistTrackCache = {
      key: cacheKey,
      tracks,
      expiresAt: Date.now() + PLAYLIST_CACHE_TTL_MS,
    };
  }

  return { tracks, inaccessiblePlaylists };
}

export async function getRandomSpotifyPlaylistTrack() {
  const playlistIds = getPlaylistIds();

  if (!isSpotifyPlaylistConfigured() || !playlistIds.length) {
    throw new SpotifyServiceError(
      "Spotify playlists are not configured",
      503,
      false,
    );
  }

  const tokenKind: TokenKind = process.env.SPOTIFY_REFRESH_TOKEN?.trim()
    ? "user"
    : "application";

  // Resolve once so bad credentials do not trigger one failure per list.
  await requestAccessToken(tokenKind);

  const { tracks, inaccessiblePlaylists } =
    await getConfiguredPlaylistTracks(playlistIds, tokenKind);

  if (!tracks.length) {
    throw new SpotifyServiceError(
      inaccessiblePlaylists === playlistIds.length
        ? "No configured Spotify playlist is accessible"
        : "No Spotify tracks are available",
      404,
    );
  }

  return {
    track: tracks[randomInt(tracks.length)],
    source: "Spotify playlist",
  };
}
