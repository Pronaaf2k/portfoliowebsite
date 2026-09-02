import { createHmac, randomUUID } from "node:crypto";
import type {
  ArcadeGame,
  ArcadeLeaderboardEntry,
  ArcadeLeaderboardResponse,
  ArcadePeriod,
  ArcadeScoreResponse,
} from "@/lib/arcade-types";
import { isUpstashConfigured, redisCommand, redisTransaction } from "@/lib/upstash-rest";

const DHAKA_OFFSET_MS = 6 * 60 * 60 * 1_000;
const WEEKLY_TTL_SECONDS = 730 * 24 * 60 * 60;
const SCORE_TTL_SECONDS = 2 * 365 * 24 * 60 * 60;
const SCORE_LIMIT_PER_HOUR = 120;
const GAMES: ArcadeGame[] = ["reaction", "recoil", "spike", "snake", "breakout"];

type CompactEntry = { i: string; n: string; s: number; l: string; t: string };

export class ArcadeGameError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ArcadeGameError";
    this.status = status;
  }
}

export function isArcadeLeaderboardConfigured() {
  return isUpstashConfigured() && Boolean(process.env.AIM_GAME_SECRET);
}

function requireConfiguration() {
  if (!isArcadeLeaderboardConfigured()) {
    throw new ArcadeGameError("Online arcade board is not configured", 503);
  }
}

function getFingerprint(request: Request) {
  const secret = process.env.AIM_GAME_SECRET;
  if (!secret) throw new ArcadeGameError("Online arcade board is not configured", 503);
  const address = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";
  const agent = request.headers.get("user-agent")?.slice(0, 240) || "unknown";
  return createHmac("sha256", secret).update(address + "|" + agent).digest("hex").slice(0, 32);
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function dateLabel(date: Date) {
  return date.getUTCFullYear() + "-" + pad(date.getUTCMonth() + 1) + "-" + pad(date.getUTCDate());
}

function weeklyLabel(now = new Date()) {
  const shifted = new Date(now.getTime() + DHAKA_OFFSET_MS);
  const daysSinceMonday = (shifted.getUTCDay() + 6) % 7;
  shifted.setUTCDate(shifted.getUTCDate() - daysSinceMonday);
  return dateLabel(shifted);
}

function isArcadeGame(value: unknown): value is ArcadeGame {
  return typeof value === "string" && GAMES.includes(value as ArcadeGame);
}

function displayLabel(game: ArcadeGame, score: number, detail: unknown) {
  if (typeof detail === "string" && detail.trim()) return detail.trim().slice(0, 32);
  return game === "reaction" ? `${score} ms` : `${score} points`;
}

function rankingScore(game: ArcadeGame, score: number) {
  return game === "reaction" ? 10_000 - score : score;
}

function keys(game: ArcadeGame, now = new Date()) {
  return {
    weekly: `arcade:leaderboard:${game}:weekly:${weeklyLabel(now)}`,
    alltime: `arcade:leaderboard:${game}:alltime`,
  };
}

function parseLeaderboard(raw: Array<string | number>, limit = 10) {
  const entries: ArcadeLeaderboardEntry[] = [];
  const seenNames = new Set<string>();
  for (let index = 0; index < raw.length; index += 2) {
    try {
      const compact = JSON.parse(String(raw[index])) as CompactEntry;
      if (!compact.i || !compact.n || !Number.isFinite(compact.s)) continue;
      const normalizedName = compact.n.trim().toLocaleLowerCase();
      if (seenNames.has(normalizedName)) continue;
      seenNames.add(normalizedName);
      entries.push({ id: compact.i, name: compact.n, score: compact.s, label: compact.l, createdAt: compact.t });
      if (entries.length >= limit) break;
    } catch {
      continue;
    }
  }
  return entries;
}

async function enforceRateLimit(fingerprint: string) {
  const hour = Math.floor(Date.now() / 3_600_000);
  const [count] = await redisTransaction([
    ["INCR", `arcade:rate:${fingerprint}:${hour}`],
    ["EXPIRE", `arcade:rate:${fingerprint}:${hour}`, 3_700],
  ]);
  if (Number(count) > SCORE_LIMIT_PER_HOUR) throw new ArcadeGameError("Too many score submissions. Try again later", 429);
}

export async function getArcadeLeaderboard(game: ArcadeGame, period: ArcadePeriod): Promise<ArcadeLeaderboardResponse> {
  const descriptor = keys(game);
  const key = descriptor[period];
  if (!isArcadeLeaderboardConfigured()) {
    return { configured: false, game, period, label: period === "weekly" ? weeklyLabel() : "ALL TIME", entries: [] };
  }
  const raw = await redisCommand<Array<string | number>>(["ZREVRANGE", key, 0, 99, "WITHSCORES"]);
  return { configured: true, game, period, label: period === "weekly" ? weeklyLabel() : "ALL TIME", entries: parseLeaderboard(raw) };
}

export async function submitArcadeScore(
  request: Request,
  input: { game?: unknown; name?: unknown; score?: unknown; detail?: unknown },
): Promise<ArcadeScoreResponse> {
  requireConfiguration();
  if (!isArcadeGame(input.game)) throw new ArcadeGameError("Invalid arcade game", 400);
  if (typeof input.name !== "string") throw new ArcadeGameError("Enter a name before publishing your score", 400);
  const name = input.name.normalize("NFKC").replace(/[^\p{L}\p{N} _-]/gu, "").replace(/\s+/g, " ").trim().slice(0, 16);
  if (!name || /^anon(?:ymous)?$/i.test(name)) throw new ArcadeGameError("Choose a real handle for the leaderboard", 400);
  const score = Number(input.score);
  const maximum = input.game === "reaction" ? 10_000 : 100_000;
  if (!Number.isFinite(score) || !Number.isInteger(score) || score < 0 || score > maximum) {
    throw new ArcadeGameError("Invalid score payload", 400);
  }
  await enforceRateLimit(getFingerprint(request));

  const id = randomUUID();
  const createdAt = new Date().toISOString();
  const compact: CompactEntry = { i: id, n: name, s: score, l: displayLabel(input.game, score, input.detail), t: createdAt };
  const member = JSON.stringify(compact);
  const periodKeys = keys(input.game);
  const rank = rankingScore(input.game, score);
  const results = await redisTransaction([
    ["HSET", `arcade:score:${id}`, "entry", member, "game", input.game],
    ["EXPIRE", `arcade:score:${id}`, SCORE_TTL_SECONDS],
    ["ZADD", periodKeys.weekly, rank, member],
    ["EXPIRE", periodKeys.weekly, WEEKLY_TTL_SECONDS],
    ["ZADD", periodKeys.alltime, rank, member],
    ["ZREVRANK", periodKeys.weekly, member],
    ["ZREVRANK", periodKeys.alltime, member],
  ]);

  return {
    accepted: true,
    weeklyRank: results[5] === null ? null : Number(results[5]) + 1,
    allTimeRank: results[6] === null ? null : Number(results[6]) + 1,
  };
}
