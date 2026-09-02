export type ArcadeGame = "reaction" | "recoil" | "spike" | "snake" | "breakout";
export type ArcadePeriod = "weekly" | "alltime";

export type ArcadeLeaderboardEntry = {
  id: string;
  name: string;
  score: number;
  label: string;
  createdAt: string;
};

export type ArcadeLeaderboardResponse = {
  configured: boolean;
  game: ArcadeGame;
  period: ArcadePeriod;
  label: string;
  entries: ArcadeLeaderboardEntry[];
};

export type ArcadeScoreResponse = {
  accepted: true;
  weeklyRank: number | null;
  allTimeRank: number | null;
};
