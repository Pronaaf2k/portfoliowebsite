import "server-only";

import { createHmac, randomUUID } from "node:crypto";
import type {
  MusicDropResponse,
  MusicPin,
  MusicTrack,
} from "@/lib/music-types";
import {
  getSpotifyTrack,
  isSpotifySearchConfigured,
  isSpotifyTrackId,
  SpotifyServiceError,
} from "@/lib/spotify";
import {
  isUpstashConfigured,
  redisCommand,
  redisTransaction,
} from "@/lib/upstash-rest";

const NOTE_MAX_LENGTH = 500;
const SENDER_MAX_LENGTH = 80;
const SUBMISSIONS_PER_HOUR = 5;
const RATE_LIMIT_TTL_SECONDS = 3_700;
const INBOX_MAX_ENTRIES = 5_000;
const INBOX_STREAM = "music:inbox";
const INBOX_INDEX = "music:inbox:index";
const PUBLIC_PIN_LIMIT = 24;
const CONTROL_CHARACTERS = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/;

type MusicDropInput = {
  trackId?: unknown;
  note?: unknown;
  sender?: unknown;
};

type MusicInboxRecord = {
  id: string;
  createdAt: string;
  track: MusicTrack;
  note: string;
  sender?: string;
  fingerprint: string;
};

export class MusicInboxError extends Error {
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
    this.name = "MusicInboxError";
    this.status = status;
    this.configured = configured;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export function isMusicInboxConfigured() {
  return Boolean(
    isSpotifySearchConfigured() &&
      isUpstashConfigured() &&
      process.env.MUSIC_EXCHANGE_SECRET,
  );
}

export function isMusicPinboardConfigured() {
  return isUpstashConfigured();
}

function requireConfiguration() {
  if (!isMusicInboxConfigured()) {
    throw new MusicInboxError(
      "Music exchange is not configured",
      503,
      false,
    );
  }
}

function codePointLength(value: string) {
  return Array.from(value).length;
}

function normalizeNote(value: unknown) {
  if (typeof value !== "string") {
    throw new MusicInboxError("Add a note for this song", 400);
  }

  const note = value
    .normalize("NFKC")
    .replace(/\r\n?/g, "\n")
    .replace(/\t/g, " ")
    .trim();

  if (!note) {
    throw new MusicInboxError("Add a note for this song", 400);
  }

  if (codePointLength(note) > NOTE_MAX_LENGTH) {
    throw new MusicInboxError(
      "Note is limited to " + NOTE_MAX_LENGTH + " characters",
      400,
    );
  }

  if (CONTROL_CHARACTERS.test(note)) {
    throw new MusicInboxError("Note contains unsupported characters", 400);
  }

  return note;
}

function normalizeSender(value: unknown) {
  if (value === undefined || value === null || value === "") return undefined;

  if (typeof value !== "string") {
    throw new MusicInboxError("Sender name is invalid", 400);
  }

  const sender = value.normalize("NFKC").replace(/\s+/g, " ").trim();
  if (!sender) return undefined;

  if (
    codePointLength(sender) > SENDER_MAX_LENGTH ||
    CONTROL_CHARACTERS.test(sender)
  ) {
    throw new MusicInboxError(
      "Sender name is limited to " + SENDER_MAX_LENGTH + " characters",
      400,
    );
  }

  return sender;
}

function normalizeTrackId(value: unknown) {
  const trackId = typeof value === "string" ? value.trim() : "";

  if (!isSpotifyTrackId(trackId)) {
    throw new MusicInboxError("Choose a valid Spotify track", 400);
  }

  return trackId;
}

function getClientFingerprint(request: Request) {
  const secret = process.env.MUSIC_EXCHANGE_SECRET;
  if (!secret) {
    throw new MusicInboxError(
      "Music exchange is not configured",
      503,
      false,
    );
  }

  const forwarded = request.headers
    .get("x-forwarded-for")
    ?.split(",")[0]
    ?.trim();
  const address = (
    forwarded ||
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-real-ip") ||
    "unknown"
  ).slice(0, 128);
  const agent = (request.headers.get("user-agent") || "unknown").slice(0, 240);

  return createHmac("sha256", secret)
    .update("music-exchange-v1\0" + address + "\0" + agent)
    .digest("hex");
}

async function enforceRateLimit(fingerprint: string) {
  const now = Date.now();
  const hour = Math.floor(now / 3_600_000);
  const key = "music:inbox:rate:" + fingerprint + ":" + hour;
  let results: unknown[];

  try {
    results = await redisTransaction([
      ["INCR", key],
      ["EXPIRE", key, RATE_LIMIT_TTL_SECONDS],
    ]);
  } catch {
    throw new MusicInboxError("Music exchange inbox is unavailable", 503);
  }

  const count = Number(results[0]);
  if (!Number.isFinite(count)) {
    throw new MusicInboxError("Music exchange inbox is unavailable", 503);
  }

  if (count > SUBMISSIONS_PER_HOUR) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil(((hour + 1) * 3_600_000 - now) / 1_000),
    );

    throw new MusicInboxError(
      "Too many song drops. Try again later",
      429,
      true,
      retryAfterSeconds,
    );
  }
}

async function fetchCanonicalTrack(trackId: string) {
  try {
    return await getSpotifyTrack(trackId);
  } catch (error) {
    if (error instanceof SpotifyServiceError) {
      if (!error.configured) {
        throw new MusicInboxError(
          "Music exchange is not configured",
          503,
          false,
        );
      }

      if (error.status === 400 || error.status === 404) {
        throw new MusicInboxError("Choose a valid Spotify track", 400);
      }

      throw new MusicInboxError(
        "Spotify track could not be verified",
        error.status,
        true,
        error.retryAfterSeconds,
      );
    }

    throw new MusicInboxError("Spotify track could not be verified", 502);
  }
}

async function storeInboxRecord(record: MusicInboxRecord) {
  const payload = JSON.stringify(record);
  let results: unknown[];

  try {
    results = await redisTransaction([
      [
        "XADD",
        INBOX_STREAM,
        "MAXLEN",
        "~",
        INBOX_MAX_ENTRIES,
        "*",
        "id",
        record.id,
        "createdAt",
        record.createdAt,
        "payload",
        payload,
      ],
      ["ZADD", INBOX_INDEX, Date.parse(record.createdAt), payload],
      [
        "ZREMRANGEBYRANK",
        INBOX_INDEX,
        0,
        -(INBOX_MAX_ENTRIES + 1),
      ],
    ]);
  } catch {
    throw new MusicInboxError("Music exchange inbox is unavailable", 503);
  }

  if (typeof results[0] !== "string" || !results[0]) {
    throw new MusicInboxError("Music exchange inbox is unavailable", 503);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function publicHttpsUrl(value: unknown) {
  if (typeof value !== "string") return null;

  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function toPublicTrack(value: unknown): MusicTrack | null {
  if (!isRecord(value)) return null;

  const id = typeof value.id === "string" ? value.id : "";
  const name = typeof value.name === "string" ? value.name : "";
  const artists = typeof value.artists === "string" ? value.artists : "";
  const album = typeof value.album === "string" ? value.album : "";
  const spotifyUrl = publicHttpsUrl(value.spotifyUrl);
  const imageUrl = value.imageUrl === null ? null : publicHttpsUrl(value.imageUrl);
  const durationMs = Number(value.durationMs);

  if (
    !isSpotifyTrackId(id) ||
    !name ||
    !artists ||
    !album ||
    !spotifyUrl ||
    !Number.isFinite(durationMs) ||
    durationMs < 0
  ) {
    return null;
  }

  return {
    id,
    name,
    artists,
    album,
    imageUrl,
    spotifyUrl,
    durationMs: Math.round(durationMs),
  };
}

function toPublicPin(value: unknown): MusicPin | null {
  if (!isRecord(value)) return null;

  const id = typeof value.id === "string" ? value.id : "";
  const createdAt = typeof value.createdAt === "string" ? value.createdAt : "";
  const note = typeof value.note === "string" ? value.note.trim() : "";
  const sender = typeof value.sender === "string" ? value.sender.trim() : "";
  const track = toPublicTrack(value.track);

  if (!id || !Number.isFinite(Date.parse(createdAt)) || !note || !track) {
    return null;
  }

  return {
    id,
    createdAt,
    track,
    note: note.slice(0, NOTE_MAX_LENGTH),
    sender: sender.slice(0, SENDER_MAX_LENGTH) || "Anonymous",
  };
}

export async function listPublicMusicPins(limit = PUBLIC_PIN_LIMIT) {
  if (!isMusicPinboardConfigured()) return [];

  const safeLimit = Math.min(PUBLIC_PIN_LIMIT, Math.max(1, Math.floor(limit)));
  const entries = await redisCommand<unknown[]>([
    "ZREVRANGE",
    INBOX_INDEX,
    0,
    safeLimit - 1,
  ]);

  return entries.flatMap((entry) => {
    try {
      const parsed = typeof entry === "string" ? JSON.parse(entry) : entry;
      const pin = toPublicPin(parsed);
      return pin ? [pin] : [];
    } catch {
      return [];
    }
  });
}
export async function submitMusicDrop(
  request: Request,
  input: MusicDropInput,
): Promise<MusicDropResponse> {
  requireConfiguration();

  const trackId = normalizeTrackId(input.trackId);
  const note = normalizeNote(input.note);
  const sender = normalizeSender(input.sender);
  const fingerprint = getClientFingerprint(request);

  await enforceRateLimit(fingerprint);
  const track = await fetchCanonicalTrack(trackId);
  const record: MusicInboxRecord = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    track,
    note,
    ...(sender ? { sender } : {}),
    fingerprint,
  };

  await storeInboxRecord(record);

  return {
    accepted: true,
    id: record.id,
  };
}
