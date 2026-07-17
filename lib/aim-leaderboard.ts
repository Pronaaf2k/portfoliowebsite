import { createHmac, randomUUID } from "node:crypto";
import type {
  AimLeaderboardEntry,
  AimLeaderboardResponse,
  AimPeriod,
  AimScoreResponse,
  AimSessionResponse,
} from "@/lib/aim-types";
import {
  isUpstashConfigured,
  redisCommand,
  redisTransaction,
} from "@/lib/upstash-rest";

export const AIM_DURATION_MS = 15_000;

const SESSION_TTL_SECONDS = 6 * 60;
const MINIMUM_RUN_MS = AIM_DURATION_MS - 1_500;
const MAXIMUM_RUN_MS = AIM_DURATION_MS + 5 * 60_000;
const MAX_HITS = 240;
const MAX_MISSES = 1_000;
const SESSION_LIMIT_PER_HOUR = 24;
const DHAKA_OFFSET_MS = 6 * 60 * 60 * 1_000;
const WEEKLY_TTL_SECONDS = 730 * 24 * 60 * 60;
const SCORE_TTL_SECONDS = 2 * 365 * 24 * 60 * 60;
const SCORE_STREAM = "aim:scores";
const ARCHIVE_INDEX = "aim:archive:index";

type SessionRecord = {
  id: string;
  fingerprint: string;
  startedAt: number;
};

type CompactEntry = {
  i: string;
  n: string;
  h: number;
  m: number;
  a: number;
  t: string;
};

type PeriodDescriptor = {
  period: AimPeriod;
  label: string;
  key: string;
};

export class AimGameError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AimGameError";
    this.status = status;
  }
}

export function isAimLeaderboardConfigured() {
  return isUpstashConfigured() && Boolean(process.env.AIM_GAME_SECRET);
}

export function sanitizePlayerName(input: unknown) {
  if (typeof input !== "string") {
    throw new AimGameError("Enter a name before publishing your score", 400);
  }

  const value = input
    .normalize("NFKC")
    .replace(/[^\p{L}\p{N} _-]/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 16);

  if (!value) {
    throw new AimGameError("Enter a name before publishing your score", 400);
  }

  if (/^anon(?:ymous)?$/i.test(value)) {
    throw new AimGameError("Choose a real handle for the leaderboard", 400);
  }

  return value;
}

function requireConfiguration() {
  if (!isAimLeaderboardConfigured()) {
    throw new AimGameError("Online leaderboard is not configured", 503);
  }
}

function getClientFingerprint(request: Request) {
  const secret = process.env.AIM_GAME_SECRET;
  if (!secret) throw new AimGameError("Online leaderboard is not configured", 503);

  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const address = forwarded || request.headers.get("x-real-ip") || "local";
  const agent = request.headers.get("user-agent")?.slice(0, 240) || "unknown";

  return createHmac("sha256", secret)
    .update(address + "|" + agent)
    .digest("hex")
    .slice(0, 32);
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function dateLabel(date: Date) {
  return (
    date.getUTCFullYear() +
    "-" +
    pad(date.getUTCMonth() + 1) +
    "-" +
    pad(date.getUTCDate())
  );
}

function startOfWeek(date: Date) {
  const start = new Date(date.getTime());
  const daysSinceMonday = (start.getUTCDay() + 6) % 7;
  start.setUTCDate(start.getUTCDate() - daysSinceMonday);
  return start;
}

function descriptorsForShiftedDate(shifted: Date) {
  const week = dateLabel(startOfWeek(shifted));

  return {
    weekly: {
      period: "weekly",
      label: week,
      key: "aim:leaderboard:weekly:" + week,
    } satisfies PeriodDescriptor,
    alltime: {
      period: "alltime",
      label: "ALL TIME",
      key: "aim:leaderboard:alltime",
    } satisfies PeriodDescriptor,
  };
}

function getPeriodDescriptors(now = new Date()) {
  return descriptorsForShiftedDate(new Date(now.getTime() + DHAKA_OFFSET_MS));
}

function parseLeaderboard(raw: Array<string | number>) {
  const entries: AimLeaderboardEntry[] = [];

  for (let index = 0; index < raw.length; index += 2) {
    try {
      const compact = JSON.parse(String(raw[index])) as CompactEntry;
      const score = Number(raw[index + 1]);
      if (
        !compact.i ||
        !compact.n ||
        /^anon(?:ymous)?$/i.test(compact.n.trim()) ||
        !Number.isFinite(score) ||
        !Number.isFinite(compact.h)
      ) {
        continue;
      }

      entries.push({
        id: compact.i,
        name: compact.n,
        hits: compact.h,
        misses: compact.m,
        accuracy: compact.a,
        createdAt: compact.t,
      });
    } catch {
      continue;
    }
  }

  return entries;
}

async function enforceSessionRateLimit(fingerprint: string) {
  const hour = Math.floor(Date.now() / 3_600_000);
  const key = "aim:rate:" + fingerprint + ":" + hour;
  const [count] = await redisTransaction([
    ["INCR", key],
    ["EXPIRE", key, 3_700],
  ]);

  if (Number(count) > SESSION_LIMIT_PER_HOUR) {
    throw new AimGameError("Too many game starts. Try again later", 429);
  }
}

export async function createAimSession(request: Request): Promise<AimSessionResponse> {
  requireConfiguration();

  const fingerprint = getClientFingerprint(request);
  await enforceSessionRateLimit(fingerprint);

  const session: SessionRecord = {
    id: randomUUID(),
    fingerprint,
    startedAt: Date.now(),
  };

  const stored = await redisCommand<string | null>([
    "SET",
    "aim:session:" + session.id,
    JSON.stringify(session),
    "EX",
    SESSION_TTL_SECONDS,
    "NX",
  ]);

  if (stored !== "OK") {
    throw new AimGameError("Could not create a game session", 503);
  }

  return {
    configured: true,
    sessionId: session.id,
    durationMs: AIM_DURATION_MS,
  };
}

export async function submitAimScore(
  request: Request,
  input: { sessionId?: unknown; name?: unknown; hits?: unknown; misses?: unknown },
): Promise<AimScoreResponse> {
  requireConfiguration();

  const sessionId = typeof input.sessionId === "string" ? input.sessionId : "";
  const hits = Number(input.hits);
  const misses = Number(input.misses);
  const playerName = sanitizePlayerName(input.name);

  if (!/^[0-9a-f-]{36}$/i.test(sessionId)) {
    throw new AimGameError("Invalid game session", 400);
  }

  if (
    !Number.isInteger(hits) ||
    !Number.isInteger(misses) ||
    hits < 0 ||
    hits > MAX_HITS ||
    misses < 0 ||
    misses > MAX_MISSES
  ) {
    throw new AimGameError("Invalid score payload", 400);
  }

  const sessionKey = "aim:session:" + sessionId;
  const stored = await redisCommand<string | null>(["GET", sessionKey]);
  if (!stored) throw new AimGameError("Game session expired", 410);

  let session: SessionRecord;
  try {
    session = JSON.parse(stored) as SessionRecord;
  } catch {
    throw new AimGameError("Game session is invalid", 410);
  }

  if (session.fingerprint !== getClientFingerprint(request)) {
    throw new AimGameError("Game session does not match this client", 403);
  }

  const elapsed = Date.now() - session.startedAt;
  if (elapsed < MINIMUM_RUN_MS) {
    throw new AimGameError("The run ended too quickly", 400);
  }
  if (elapsed > MAXIMUM_RUN_MS) {
    throw new AimGameError("Game session expired", 410);
  }

  const consumed = await redisCommand<string | null>(["GETDEL", sessionKey]);
  if (!consumed) throw new AimGameError("Score was already submitted", 409);

  const attempts = hits + misses;
  const accuracy = attempts ? Math.round((hits / attempts) * 1_000) / 10 : 0;
  // Hits remain dominant; accuracy contributes at most 0.01 as the tie-breaker.
  const rankingScore = hits + accuracy / 10_000;
  const createdAt = new Date().toISOString();
  const compact: CompactEntry = {
    i: session.id,
    n: playerName,
    h: hits,
    m: misses,
    a: accuracy,
    t: createdAt,
  };
  const member = JSON.stringify(compact);
  const periods = getPeriodDescriptors();

  const results = await redisTransaction([
    ["HSET", "aim:score:" + session.id, "entry", member],
    ["EXPIRE", "aim:score:" + session.id, SCORE_TTL_SECONDS],
    [
      "XADD",
      SCORE_STREAM,
      "MAXLEN",
      "~",
      10_000,
      "*",
      "entry",
      member,
      "week",
      periods.weekly.label,
    ],
    ["ZADD", periods.weekly.key, rankingScore, member],
    ["EXPIRE", periods.weekly.key, WEEKLY_TTL_SECONDS],
    ["ZADD", periods.alltime.key, rankingScore, member],
    ["ZREVRANK", periods.weekly.key, member],
    ["ZREVRANK", periods.alltime.key, member],
  ]);

  const weeklyRank = results[6] === null ? null : Number(results[6]) + 1;
  const allTimeRank = results[7] === null ? null : Number(results[7]) + 1;

  return {
    accepted: true,
    sessionId: session.id,
    weeklyRank,
    allTimeRank,
  };
}

export async function getAimLeaderboard(
  period: AimPeriod,
  limit = 10,
): Promise<AimLeaderboardResponse> {
  const descriptors = getPeriodDescriptors();
  const descriptor = descriptors[period];

  if (!isAimLeaderboardConfigured()) {
    return {
      configured: false,
      period,
      label: descriptor.label,
      entries: [],
    };
  }

  const raw = await redisCommand<Array<string | number>>([
    "ZREVRANGE",
    descriptor.key,
    0,
    Math.max(0, limit - 1),
    "WITHSCORES",
  ]);

  return {
    configured: true,
    period,
    label: descriptor.label,
    entries: parseLeaderboard(raw),
  };
}

function getCompletedPeriods(now = new Date()) {
  const shifted = new Date(now.getTime() + DHAKA_OFFSET_MS);
  if (shifted.getUTCDay() !== 1) return [];

  const previousWeek = startOfWeek(shifted);
  previousWeek.setUTCDate(previousWeek.getUTCDate() - 7);
  return [descriptorsForShiftedDate(previousWeek).weekly];
}

export async function recordAimHeartbeat(now = new Date()) {
  requireConfiguration();
  const at = now.toISOString();

  await redisCommand<string>([
    "SET",
    "aim:system:heartbeat",
    JSON.stringify({ at, service: "aim-leaderboard", version: 2 }),
  ]);

  return { at };
}

export async function snapshotCompletedLeaderboards(now = new Date()) {
  requireConfiguration();
  const snapshots: Array<{ period: AimPeriod; label: string; entries: number }> = [];

  for (const target of getCompletedPeriods(now)) {
    const raw = await redisCommand<Array<string | number>>([
      "ZREVRANGE",
      target.key,
      0,
      99,
      "WITHSCORES",
    ]);
    const entries = parseLeaderboard(raw);
    const archiveKey = "aim:archive:" + target.period + ":" + target.label;
    const archive = JSON.stringify({
      period: target.period,
      label: target.label,
      archivedAt: now.toISOString(),
      entries,
    });

    await redisTransaction([
      ["SET", archiveKey, archive, "NX"],
      [
        "ZADD",
        ARCHIVE_INDEX,
        now.getTime(),
        target.period + ":" + target.label,
      ],
    ]);

    snapshots.push({
      period: target.period,
      label: target.label,
      entries: entries.length,
    });
  }

  return snapshots;
}
