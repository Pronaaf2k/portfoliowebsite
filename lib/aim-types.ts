export type AimPeriod = "weekly" | "alltime";

export type AimLeaderboardEntry = {
  id: string;
  name: string;
  hits: number;
  misses: number;
  accuracy: number;
  createdAt: string;
};

export type AimLeaderboardResponse = {
  configured: boolean;
  period: AimPeriod;
  label: string;
  entries: AimLeaderboardEntry[];
};

export type AimSessionResponse = {
  configured: true;
  sessionId: string;
  durationMs: number;
};

export type AimScoreResponse = {
  accepted: true;
  sessionId: string;
  weeklyRank: number | null;
  allTimeRank: number | null;
};
