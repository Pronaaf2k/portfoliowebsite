"use client";

import {
  Crosshair,
  RotateCcw,
  Trophy,
  Wifi,
  WifiOff,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import type {
  AimLeaderboardResponse,
  AimPeriod,
  AimScoreResponse,
  AimSessionResponse,
} from "@/lib/aim-types";

const GAME_DURATION_MS = 15_000;

type GamePhase = "idle" | "arming" | "running" | "submitting" | "complete";
type ConnectionMode = "checking" | "online" | "local";
type TargetPosition = { x: number; y: number };

function nextTarget(previous: TargetPosition): TargetPosition {
  let candidate = previous;

  for (let attempt = 0; attempt < 8; attempt += 1) {
    candidate = {
      x: 9 + Math.random() * 82,
      y: 12 + Math.random() * 76,
    };

    const distance = Math.hypot(candidate.x - previous.x, candidate.y - previous.y);
    if (distance > 28) return candidate;
  }

  return candidate;
}

function formatTimer(milliseconds: number) {
  return (Math.max(0, milliseconds) / 1_000).toFixed(1).padStart(4, "0");
}

export function AimChallenge() {
  const [phase, setPhase] = useState<GamePhase>("idle");
  const [connection, setConnection] = useState<ConnectionMode>("checking");
  const [name, setName] = useState("ANON");
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION_MS);
  const [target, setTarget] = useState<TargetPosition>({ x: 68, y: 42 });
  const [period, setPeriod] = useState<AimPeriod>("weekly");
  const [notice, setNotice] = useState("15 seconds. Every clean click counts.");
  const [lastSessionId, setLastSessionId] = useState<string | null>(null);
  const [leaderboards, setLeaderboards] = useState<
    Record<AimPeriod, AimLeaderboardResponse | null>
  >({ weekly: null, alltime: null });

  const hitsRef = useRef(0);
  const missesRef = useRef(0);
  const deadlineRef = useRef(0);
  const durationRef = useRef(GAME_DURATION_MS);
  const sessionIdRef = useRef<string | null>(null);
  const finishingRef = useRef(false);

  const refreshLeaderboards = useCallback(async () => {
    try {
      const [weeklyResponse, allTimeResponse] = await Promise.all([
        fetch("/api/aim/leaderboard?period=weekly", { cache: "no-store" }),
        fetch("/api/aim/leaderboard?period=alltime", { cache: "no-store" }),
      ]);
      const [weekly, alltime] = (await Promise.all([
        weeklyResponse.json(),
        allTimeResponse.json(),
      ])) as [AimLeaderboardResponse, AimLeaderboardResponse];

      setLeaderboards({ weekly, alltime });
      setConnection(weekly.configured && alltime.configured ? "online" : "local");
    } catch {
      setConnection("local");
    }
  }, []);

  useEffect(() => {
    const startupTimer = window.setTimeout(() => {
      try {
        const savedName = window.localStorage.getItem("aim-player-name");
        if (savedName) setName(savedName);
      } catch {
        // Local storage is optional; the game still works without it.
      }

      void refreshLeaderboards();
    }, 0);

    return () => window.clearTimeout(startupTimer);
  }, [refreshLeaderboards]);

  const moveTarget = useCallback(() => {
    setTarget((previous) => nextTarget(previous));
  }, []);

  const finishGame = useCallback(async () => {
    if (finishingRef.current) return;
    finishingRef.current = true;
    setTimeLeft(0);
    setPhase("submitting");

    const finalHits = hitsRef.current;
    const finalMisses = missesRef.current;
    const sessionId = sessionIdRef.current;

    if (!sessionId) {
      setNotice("Local run complete. Connect Upstash to publish it.");
      setPhase("complete");
      return;
    }

    try {
      const response = await fetch("/api/aim/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, hits: finalHits, misses: finalMisses }),
      });
      const payload = (await response.json()) as
        | AimScoreResponse
        | { accepted: false; error?: string };

      if (!response.ok || !payload.accepted) {
        throw new Error("error" in payload ? payload.error : "Score was not accepted");
      }

      setLastSessionId(payload.sessionId);
      const rank = payload.weeklyRank ? "Weekly rank #" + payload.weeklyRank + "." : "";
      setNotice((rank + " Score saved to weekly and all-time boards.").trim());
      await refreshLeaderboards();
    } catch (error) {
      setNotice(
        error instanceof Error && error.message
          ? error.message
          : "Run complete, but the score could not be saved.",
      );
    } finally {
      setPhase("complete");
    }
  }, [refreshLeaderboards]);

  useEffect(() => {
    if (phase !== "running") return;

    const tick = () => {
      const remaining = Math.max(0, deadlineRef.current - performance.now());
      setTimeLeft(remaining);
      if (remaining <= 0) void finishGame();
    };

    tick();
    const timer = window.setInterval(tick, 50);
    return () => window.clearInterval(timer);
  }, [finishGame, phase]);

  const startGame = async () => {
    if (phase === "arming" || phase === "running" || phase === "submitting") return;

    const playerName = name.trim().slice(0, 16) || "ANON";
    setName(playerName);
    try {
      window.localStorage.setItem("aim-player-name", playerName);
    } catch {
      // A blocked storage API should never block the game.
    }

    setPhase("arming");
    setNotice("Opening a verified run...");
    setLastSessionId(null);
    sessionIdRef.current = null;
    durationRef.current = GAME_DURATION_MS;

    try {
      const response = await fetch("/api/aim/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: playerName }),
      });
      const payload = (await response.json()) as
        | AimSessionResponse
        | { configured?: false; error?: string };

      if (!response.ok || !("sessionId" in payload)) {
        throw new Error("Online board unavailable");
      }

      sessionIdRef.current = payload.sessionId;
      durationRef.current = payload.durationMs;
      setConnection("online");
      setNotice("Verified session. Make it count.");
    } catch {
      setConnection("local");
      setNotice("Local mode. This run will stay on this screen.");
    }

    hitsRef.current = 0;
    missesRef.current = 0;
    finishingRef.current = false;
    setHits(0);
    setMisses(0);
    setTimeLeft(durationRef.current);
    moveTarget();
    deadlineRef.current = performance.now() + durationRef.current;
    setPhase("running");
  };

  const registerHit = () => {
    if (phase !== "running") return;
    const nextHits = hitsRef.current + 1;
    hitsRef.current = nextHits;
    setHits(nextHits);
    moveTarget();
  };

  const hitTarget = (event: PointerEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    registerHit();
  };

  const hitTargetWithKeyboard = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    registerHit();
  };

  const missTarget = (event: PointerEvent<HTMLDivElement>) => {
    if (phase !== "running" || event.target !== event.currentTarget) return;
    const nextMisses = missesRef.current + 1;
    missesRef.current = nextMisses;
    setMisses(nextMisses);
  };

  const attempts = hits + misses;
  const accuracy = attempts ? Math.round((hits / attempts) * 1_000) / 10 : 100;
  const leaderboard = leaderboards[period];
  const phaseLabel = phase === "complete" ? "COMPLETE" : phase.toUpperCase();

  return (
    <section className="aim-challenge" aria-labelledby="aim-challenge-title">
      <div className="aim-challenge-head">
        <div>
          <p className="eyebrow">
            <Crosshair size={14} aria-hidden="true" />
            Live drill / 15 seconds
          </p>
          <h2 id="aim-challenge-title">First click.</h2>
        </div>
        <p>
          Hit every target before it moves. The board ranks clean hits first, then
          accuracy when scores are tied.
        </p>
      </div>

      <div className="aim-game-layout">
        <div className="aim-stage">
          <div className="aim-player-row">
            <label>
              <span>Handle</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={16}
                disabled={phase === "arming" || phase === "running" || phase === "submitting"}
                autoComplete="nickname"
                aria-label="Leaderboard handle"
              />
            </label>
            <span className={"aim-connection is-" + connection}>
              {connection === "online" ? <Wifi size={14} /> : <WifiOff size={14} />}
              {connection === "checking"
                ? "Checking board"
                : connection === "online"
                  ? "Board online"
                  : "Local mode"}
            </span>
          </div>

          <div className="aim-hud" aria-live="polite">
            <div>
              <span>Time</span>
              <strong>{formatTimer(timeLeft)}</strong>
            </div>
            <div>
              <span>Hits</span>
              <strong>{String(hits).padStart(2, "0")}</strong>
            </div>
            <div>
              <span>Accuracy</span>
              <strong>{accuracy.toFixed(1)}%</strong>
            </div>
            <div>
              <span>State</span>
              <strong>{phaseLabel}</strong>
            </div>
          </div>

          <div className="aim-board" onPointerDown={missTarget}>
            {phase === "running" && (
              <button
                key={hits}
                type="button"
                className="aim-target"
                style={{ left: target.x + "%", top: target.y + "%" }}
                onPointerDown={hitTarget}
                onKeyDown={hitTargetWithKeyboard}
                aria-label="Hit target"
              >
                <i aria-hidden="true" />
              </button>
            )}

            {phase !== "running" && (
              <div className="aim-board-state">
                <Crosshair size={30} strokeWidth={1.4} aria-hidden="true" />
                {phase === "complete" ? (
                  <>
                    <strong>{hits} clean hits</strong>
                    <p>{notice}</p>
                    <button type="button" className="button button-primary" onClick={startGame}>
                      <RotateCcw size={16} aria-hidden="true" />
                      Run it again
                    </button>
                  </>
                ) : phase === "arming" || phase === "submitting" ? (
                  <>
                    <strong>{phase === "arming" ? "Arming run" : "Saving score"}</strong>
                    <p>{notice}</p>
                  </>
                ) : (
                  <>
                    <strong>15 seconds. No warm-up.</strong>
                    <p>{notice}</p>
                    <button type="button" className="button button-primary" onClick={startGame}>
                      <Crosshair size={16} aria-hidden="true" />
                      Start run
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <aside className="aim-leaderboard" aria-labelledby="aim-leaderboard-title">
          <div className="aim-leaderboard-head">
            <div>
              <Trophy size={18} aria-hidden="true" />
              <h3 id="aim-leaderboard-title">High scores</h3>
            </div>
            <span>{leaderboard?.label ?? "Dhaka time"}</span>
          </div>

          <div className="aim-period-tabs" role="tablist" aria-label="Leaderboard period">
            {(["weekly", "alltime"] as const).map((item) => (
              <button
                type="button"
                role="tab"
                aria-selected={period === item}
                className={period === item ? "is-active" : ""}
                onClick={() => setPeriod(item)}
                key={item}
              >
                {item === "weekly" ? "This week" : "All time"}
              </button>
            ))}
          </div>

          {leaderboard?.configured && leaderboard.entries.length ? (
            <>
              <div className="aim-score-columns" aria-hidden="true">
                <span>Rank</span>
                <span>Handle</span>
                <span>Accuracy</span>
                <span>Hits</span>
              </div>
              <ol className="aim-score-list">
                {leaderboard.entries.map((entry, index) => (
                  <li
                    key={entry.id}
                    className={entry.id === lastSessionId ? "is-current" : ""}
                  >
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <strong>{entry.name}</strong>
                    <small>{entry.accuracy.toFixed(1)}%</small>
                    <b>{entry.hits}</b>
                  </li>
                ))}
              </ol>
            </>
          ) : (
            <div className="aim-score-empty">
              <span>{connection === "checking" ? "READING" : "NO SIGNAL"}</span>
              <p>
                {connection === "checking"
                  ? "Reading the current board."
                  : leaderboard?.configured
                    ? "No scores yet. The first clean run owns this board."
                    : "The game is playable locally. Add Upstash credentials to publish scores."}
              </p>
            </div>
          )}

          <div className="aim-leaderboard-foot">
            <span>Rank = hits, then accuracy</span>
            <span>Dhaka / UTC+6</span>
          </div>
        </aside>
      </div>
    </section>
  );
}
