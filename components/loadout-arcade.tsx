"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import type { ArcadeLeaderboardResponse, ArcadeScoreResponse } from "@/lib/arcade-types";

type ArcadeGame = "reaction" | "recoil" | "spike" | "snake" | "breakout";

const arcadeGames: Array<{ key: ArcadeGame; label: string; note: string }> = [
  { key: "reaction", label: "Reaction", note: "Beat the signal" },
  { key: "recoil", label: "Recoil", note: "Hold the angle" },
  { key: "spike", label: "Spike / Defuse", note: "Remember the sequence" },
  { key: "snake", label: "Snake", note: "Classic grid run" },
  { key: "breakout", label: "Breakout", note: "Clear the wall" },
];

type ScoreReport = { score: number; label: string };

function GameShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="arcade-game-shell">
      <div className="arcade-game-heading">
        <div>
          <span className="arcade-game-kicker">Browser / arcade</span>
          <h3>{title}</h3>
        </div>
        <p>{description}</p>
      </div>
      {children}
    </div>
  );
}

function GameButton({
  children,
  onClick,
  disabled = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button className="arcade-button" type="button" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

type ReactionPhase = "idle" | "waiting" | "ready" | "too-soon" | "result";

function ReactionGame({ onComplete }: { onComplete: (result: ScoreReport) => void }) {
  const [phase, setPhase] = useState<ReactionPhase>("idle");
  const [result, setResult] = useState<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const startedAtRef = useRef(0);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  const start = () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    setResult(null);
    setPhase("waiting");
    timerRef.current = window.setTimeout(() => {
      startedAtRef.current = performance.now();
      setPhase("ready");
    }, 1_200 + Math.random() * 2_000);
  };

  const handleStageClick = () => {
    if (phase === "waiting") {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      setPhase("too-soon");
      return;
    }

    if (phase === "ready") {
      const reaction = Math.round(performance.now() - startedAtRef.current);
      setResult(reaction);
      onComplete({ score: reaction, label: `${reaction} ms` });
      setPhase("result");
    }
  };

  const stageLabel = {
    idle: "Press start, then wait for the signal.",
    waiting: "Wait for it...",
    ready: "CLICK NOW",
    "too-soon": "Too soon. Reset and try again.",
    result: `${result} ms — clean reaction.`,
  }[phase];

  return (
    <GameShell title="Reaction time test." description="A clean signal, one click, no warm-up.">
      <div className={`arcade-stage reaction-stage reaction-${phase}`}>
        <button
          className="reaction-signal"
          type="button"
          onClick={handleStageClick}
          aria-label={stageLabel}
        >
          <span>{stageLabel}</span>
        </button>
      </div>
      <div className="arcade-game-footer">
        <span>{result === null ? "BEST RUN / --" : `LAST RUN / ${result} MS`}</span>
        <GameButton onClick={start}>{phase === "waiting" ? "Reset" : "Start test"}</GameButton>
      </div>
    </GameShell>
  );
}

type Point = { x: number; y: number };

function RecoilGame({ onComplete }: { onComplete: (result: ScoreReport) => void }) {
  const [running, setRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [target, setTarget] = useState<Point>({ x: 70, y: 72 });
  const [pointer, setPointer] = useState<Point>({ x: 50, y: 50 });
  const deadlineRef = useRef(0);
  const hitsRef = useRef(0);
  const missesRef = useRef(0);
  const finishedRef = useRef(false);

  useEffect(() => {
    if (!running) return;

    const timer = window.setInterval(() => {
      const remaining = Math.max(0, deadlineRef.current - performance.now());
      setTimeLeft(Math.ceil(remaining / 1_000));
      if (remaining <= 0) {
        setRunning(false);
        if (!finishedRef.current) {
          finishedRef.current = true;
          onComplete({ score: hitsRef.current, label: `${hitsRef.current} hits / ${missesRef.current} misses` });
        }
      }
    }, 100);

    const drift = window.setInterval(() => {
      setTarget((current) => ({
        x: Math.min(90, Math.max(10, current.x + (Math.random() - 0.5) * 8)),
        y: current.y < 12 ? 86 : current.y - 1.8,
      }));
    }, 70);

    return () => {
      window.clearInterval(timer);
      window.clearInterval(drift);
    };
  }, [onComplete, running]);

  const start = () => {
    deadlineRef.current = performance.now() + 15_000;
    setTimeLeft(15);
    setHits(0);
    setMisses(0);
    hitsRef.current = 0;
    missesRef.current = 0;
    finishedRef.current = false;
    setTarget({ x: 70, y: 72 });
    setRunning(true);
  };

  const handlePointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    setPointer({
      x: ((event.clientX - bounds.left) / bounds.width) * 100,
      y: ((event.clientY - bounds.top) / bounds.height) * 100,
    });
  };

  const handleShot = (event: PointerEvent<HTMLButtonElement>) => {
    if (!running) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const shot = {
      x: ((event.clientX - bounds.left) / bounds.width) * 100,
      y: ((event.clientY - bounds.top) / bounds.height) * 100,
    };
    const distance = Math.hypot(shot.x - target.x, shot.y - target.y);
    if (distance < 9) {
      hitsRef.current += 1;
      setHits((value) => value + 1);
      setTarget({ x: 12 + Math.random() * 76, y: 74 + Math.random() * 16 });
    } else {
      missesRef.current += 1;
      setMisses((value) => value + 1);
    }
  };

  return (
    <GameShell title="Recoil control." description="Track the target as the recoil climbs. Click inside the ring.">
      <button
        className={`arcade-stage recoil-stage${running ? " is-live" : ""}`}
        type="button"
        onPointerMove={handlePointerMove}
        onPointerDown={handleShot}
        aria-label="Recoil control range"
      >
        <span className="recoil-grid" aria-hidden="true" />
        {running ? (
          <>
            <i className="recoil-crosshair" style={{ left: `${pointer.x}%`, top: `${pointer.y}%` }} />
            <i className="recoil-target" style={{ left: `${target.x}%`, top: `${target.y}%` }} />
          </>
        ) : (
          <span className="arcade-stage-prompt">{timeLeft === 0 ? "Run complete." : "Start the range."}</span>
        )}
      </button>
      <div className="arcade-game-footer arcade-score-row">
        <span>TIME / {String(timeLeft).padStart(2, "0")}S</span>
        <span>HITS / {String(hits).padStart(2, "0")}</span>
        <span>MISS / {String(misses).padStart(2, "0")}</span>
        <GameButton onClick={start}>{running ? "Restart" : "Start range"}</GameButton>
      </div>
    </GameShell>
  );
}

const spikeWires = ["RED", "BLUE", "GOLD", "GREEN"];

function shuffledWires() {
  return [...Array(spikeWires.length).keys()].sort(() => Math.random() - 0.5);
}

type SpikePhase = "idle" | "preview" | "running" | "won" | "lost";

function SpikeGame({ onComplete }: { onComplete: (result: ScoreReport) => void }) {
  const [phase, setPhase] = useState<SpikePhase>("idle");
  const [sequence, setSequence] = useState<number[]>([]);
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const deadlineRef = useRef(0);

  useEffect(() => {
    if (phase !== "preview") return;
    const timer = window.setTimeout(() => setPhase("running"), 2_200);
    return () => window.clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "running") return;
    const timer = window.setInterval(() => {
      const remaining = Math.max(0, deadlineRef.current - performance.now());
      setTimeLeft(Math.ceil(remaining / 1_000));
      if (remaining <= 0) setPhase("lost");
    }, 100);
    return () => window.clearInterval(timer);
  }, [phase]);

  const start = () => {
    setSequence(shuffledWires());
    setProgress(0);
    setTimeLeft(15);
    deadlineRef.current = performance.now() + 15_000;
    setPhase("preview");
  };

  const chooseWire = (wire: number) => {
    if (phase !== "running") return;
    if (wire !== sequence[progress]) {
      setPhase("lost");
      return;
    }
    if (progress === sequence.length - 1) {
      onComplete({ score: Math.max(1, timeLeft * 100 + sequence.length), label: `${timeLeft}s remaining` });
      setPhase("won");
      return;
    }
    setProgress((value) => value + 1);
  };

  const message = {
    idle: "Start the sequence drill.",
    preview: "Memorize the order...",
    running: `Input ${progress + 1} / ${sequence.length}`,
    won: "Spike defused. Clean memory.",
    lost: timeLeft === 0 ? "Time expired." : "Wrong wire. Reset the drill.",
  }[phase];

  return (
    <GameShell title="Spike plant / defuse." description="Memorize the wire order, then clear it before the clock does.">
      <div className="arcade-stage spike-stage">
        <div className="spike-status">
          <span>{message}</span>
          <strong>{String(timeLeft).padStart(2, "0")}S</strong>
        </div>
        <div className="spike-wires">
          {spikeWires.map((wire, index) => (
            <button
              key={wire}
              className={`spike-wire spike-wire-${index}`}
              type="button"
              onClick={() => chooseWire(index)}
              disabled={phase !== "running"}
            >
              <i aria-hidden="true" />
              <span>{wire}</span>
            </button>
          ))}
        </div>
        <div className="spike-sequence" aria-label="Wire sequence">
          {spikeWires.map((wire, index) => (
            <span className={phase === "preview" ? `is-wire-${sequence[index]}` : ""} key={wire}>
              {phase === "preview" ? index + 1 : index < progress ? "OK" : "--"}
            </span>
          ))}
        </div>
      </div>
      <div className="arcade-game-footer">
        <span>SEQUENCE / {sequence.length ? "4 INPUTS" : "READY"}</span>
        <GameButton onClick={start}>{phase === "preview" || phase === "running" ? "Reset" : "Start drill"}</GameButton>
      </div>
    </GameShell>
  );
}

type SnakePoint = { x: number; y: number };
type SnakeDirection = SnakePoint;
const snakeColumns = 20;
const snakeRows = 12;

function makeSnakeFood(snake: SnakePoint[]) {
  let food = { x: Math.floor(Math.random() * snakeColumns), y: Math.floor(Math.random() * snakeRows) };
  while (snake.some((part) => part.x === food.x && part.y === food.y)) {
    food = { x: Math.floor(Math.random() * snakeColumns), y: Math.floor(Math.random() * snakeRows) };
  }
  return food;
}

function drawSnakeBoard(canvas: HTMLCanvasElement | null, snake: SnakePoint[], food: SnakePoint) {
  const context = canvas?.getContext("2d");
  if (!canvas || !context) return;
  const cellWidth = canvas.width / snakeColumns;
  const cellHeight = canvas.height / snakeRows;
  context.fillStyle = "#0d1114";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = "rgba(189, 205, 213, .09)";
  context.lineWidth = 1;
  for (let x = 1; x < snakeColumns; x += 1) {
    context.beginPath();
    context.moveTo(x * cellWidth, 0);
    context.lineTo(x * cellWidth, canvas.height);
    context.stroke();
  }
  for (let y = 1; y < snakeRows; y += 1) {
    context.beginPath();
    context.moveTo(0, y * cellHeight);
    context.lineTo(canvas.width, y * cellHeight);
    context.stroke();
  }
  context.fillStyle = "#dd695d";
  context.fillRect(food.x * cellWidth + 5, food.y * cellHeight + 5, cellWidth - 10, cellHeight - 10);
  snake.forEach((part, index) => {
    context.fillStyle = index === 0 ? "#f4c95d" : "#74b5c4";
    context.fillRect(part.x * cellWidth + 3, part.y * cellHeight + 3, cellWidth - 6, cellHeight - 6);
  });
}

function SnakeGame({ onComplete }: { onComplete: (result: ScoreReport) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const snakeRef = useRef<SnakePoint[]>([
    { x: 8, y: 6 },
    { x: 7, y: 6 },
    { x: 6, y: 6 },
  ]);
  const directionRef = useRef<SnakeDirection>({ x: 1, y: 0 });
  const queuedDirectionRef = useRef<SnakeDirection>({ x: 1, y: 0 });
  const foodRef = useRef<SnakePoint>({ x: 14, y: 6 });
  const scoreRef = useRef(0);
  const finishedRef = useRef(false);
  const [status, setStatus] = useState<"idle" | "running" | "won" | "lost">("idle");
  const [score, setScore] = useState(0);

  const start = () => {
    const snake = [{ x: 8, y: 6 }, { x: 7, y: 6 }, { x: 6, y: 6 }];
    snakeRef.current = snake;
    directionRef.current = { x: 1, y: 0 };
    queuedDirectionRef.current = { x: 1, y: 0 };
    foodRef.current = makeSnakeFood(snake);
    setScore(0);
    scoreRef.current = 0;
    finishedRef.current = false;
    setStatus("running");
    boardRef.current?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const directions: Record<string, SnakeDirection> = {
      ArrowUp: { x: 0, y: -1 },
      w: { x: 0, y: -1 },
      ArrowDown: { x: 0, y: 1 },
      s: { x: 0, y: 1 },
      ArrowLeft: { x: -1, y: 0 },
      a: { x: -1, y: 0 },
      ArrowRight: { x: 1, y: 0 },
      d: { x: 1, y: 0 },
    };
    const next = directions[event.key];
    if (!next) return;
    event.preventDefault();
    const current = directionRef.current;
    if (next.x + current.x === 0 && next.y + current.y === 0) return;
    queuedDirectionRef.current = next;
  };

  useEffect(() => {
    if (status !== "running") return;
    let previous = 0;
    let animationFrame = 0;

    const tick = (timestamp: number) => {
      if (timestamp - previous >= 115) {
        previous = timestamp;
        const direction = queuedDirectionRef.current;
        directionRef.current = direction;
        const head = snakeRef.current[0];
        const nextHead = { x: head.x + direction.x, y: head.y + direction.y };
        const hitWall = nextHead.x < 0 || nextHead.x >= snakeColumns || nextHead.y < 0 || nextHead.y >= snakeRows;
        const hitSelf = snakeRef.current.some((part) => part.x === nextHead.x && part.y === nextHead.y);
        if (hitWall || hitSelf) {
          setStatus("lost");
          if (!finishedRef.current) {
            finishedRef.current = true;
            onComplete({ score: scoreRef.current, label: `${scoreRef.current} apples` });
          }
          return;
        }

        const nextSnake = [nextHead, ...snakeRef.current];
        const ateFood = nextHead.x === foodRef.current.x && nextHead.y === foodRef.current.y;
        if (ateFood) {
          scoreRef.current += 1;
          setScore((value) => value + 1);
          foodRef.current = makeSnakeFood(nextSnake);
        } else {
          nextSnake.pop();
        }
        snakeRef.current = nextSnake;
        drawSnakeBoard(canvasRef.current, snakeRef.current, foodRef.current);
      }
      animationFrame = window.requestAnimationFrame(tick);
    };

    animationFrame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [onComplete, status]);

  useEffect(() => {
    drawSnakeBoard(canvasRef.current, snakeRef.current, foodRef.current);
  }, [score, status]);

  return (
    <GameShell title="Snake." description="The classic, tuned for a five-minute break between builds.">
      <div className="arcade-canvas-wrap" ref={boardRef} tabIndex={0} onKeyDown={handleKeyDown}>
        <canvas ref={canvasRef} width="400" height="240" aria-label="Snake game board" />
        {status !== "running" && <span className="arcade-canvas-overlay">{status === "idle" ? "Use WASD or arrow keys." : status === "won" ? "Board cleared." : "Run ended."}</span>}
      </div>
      <div className="arcade-game-footer arcade-score-row">
        <span>SCORE / {String(score).padStart(2, "0")}</span>
        <span>INPUT / WASD + ARROWS</span>
        <GameButton onClick={start}>{status === "running" ? "Restart" : "Start snake"}</GameButton>
      </div>
    </GameShell>
  );
}

type BreakoutState = {
  ballX: number;
  ballY: number;
  velocityX: number;
  velocityY: number;
  paddleX: number;
  bricks: boolean[][];
};

function newBreakoutState(): BreakoutState {
  return {
    ballX: 200,
    ballY: 180,
    velocityX: 2.7,
    velocityY: -3.2,
    paddleX: 200,
    bricks: Array.from({ length: 5 }, () => Array.from({ length: 8 }, () => true)),
  };
}

function BreakoutGame({ onComplete }: { onComplete: (result: ScoreReport) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<BreakoutState>(newBreakoutState());
  const [status, setStatus] = useState<"idle" | "running" | "won" | "lost">("idle");
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);
  const finishedRef = useRef(false);

  const draw = (state: BreakoutState) => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    context.fillStyle = "#0d1114";
    context.fillRect(0, 0, canvas.width, canvas.height);
    state.bricks.forEach((row, rowIndex) =>
      row.forEach((active, columnIndex) => {
        if (!active) return;
        context.fillStyle = rowIndex % 2 === 0 ? "#74b5c4" : "#f4c95d";
        context.fillRect(25 + columnIndex * 45, 24 + rowIndex * 19, 37, 11);
      }),
    );
    context.fillStyle = "#f4c95d";
    context.fillRect(state.paddleX - 38, 220, 76, 8);
    context.beginPath();
    context.arc(state.ballX, state.ballY, 5, 0, Math.PI * 2);
    context.fillStyle = "#dd695d";
    context.fill();
  };

  const start = () => {
    stateRef.current = newBreakoutState();
    setScore(0);
    scoreRef.current = 0;
    finishedRef.current = false;
    setStatus("running");
    canvasRef.current?.focus();
  };

  const movePaddle = (event: PointerEvent<HTMLCanvasElement>) => {
    const canvas = event.currentTarget;
    const bounds = canvas.getBoundingClientRect();
    stateRef.current.paddleX = Math.min(362, Math.max(38, ((event.clientX - bounds.left) / bounds.width) * 400));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLCanvasElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight" && event.key !== "a" && event.key !== "d") return;
    event.preventDefault();
    stateRef.current.paddleX += event.key === "ArrowLeft" || event.key === "a" ? -18 : 18;
    stateRef.current.paddleX = Math.min(362, Math.max(38, stateRef.current.paddleX));
  };

  useEffect(() => {
    draw(stateRef.current);
  }, [score, status]);

  useEffect(() => {
    if (status !== "running") return;
    let previous = performance.now();
    let animationFrame = 0;

    const tick = (timestamp: number) => {
      const state = stateRef.current;
      const delta = Math.min(2, (timestamp - previous) / 16.67);
      previous = timestamp;
      state.ballX += state.velocityX * delta;
      state.ballY += state.velocityY * delta;
      if (state.ballX < 5 || state.ballX > 395) {
        state.velocityX *= -1;
        state.ballX = Math.min(395, Math.max(5, state.ballX));
      }
      if (state.ballY < 5) {
        state.velocityY = Math.abs(state.velocityY);
        state.ballY = 5;
      }
      if (state.ballY > 211 && state.ballY < 230 && Math.abs(state.ballX - state.paddleX) < 45 && state.velocityY > 0) {
        state.velocityY = -Math.abs(state.velocityY);
      }
      if (state.ballY > 246) {
        setStatus("lost");
        if (!finishedRef.current) {
          finishedRef.current = true;
          onComplete({ score: scoreRef.current, label: `${scoreRef.current} blocks` });
        }
        return;
      }

      let cleared = true;
      state.bricks.forEach((row, rowIndex) =>
        row.forEach((active, columnIndex) => {
          if (!active) return;
          cleared = false;
          const brickX = 25 + columnIndex * 45;
          const brickY = 24 + rowIndex * 19;
          if (state.ballX > brickX && state.ballX < brickX + 37 && state.ballY > brickY && state.ballY < brickY + 11) {
            row[columnIndex] = false;
            state.velocityY *= -1;
            scoreRef.current += 1;
            setScore((value) => value + 1);
          }
        }),
      );
      draw(state);
      if (cleared) {
        setStatus("won");
        if (!finishedRef.current) {
          finishedRef.current = true;
          onComplete({ score: scoreRef.current, label: `${scoreRef.current} blocks` });
        }
        return;
      }
      animationFrame = window.requestAnimationFrame(tick);
    };

    animationFrame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [onComplete, status]);

  return (
    <GameShell title="Breakout." description="Clear the wall. Keep the ball alive. Classic rules apply.">
      <canvas
        className="arcade-canvas breakout-canvas"
        ref={canvasRef}
        width="400"
        height="240"
        tabIndex={0}
        onPointerMove={movePaddle}
        onKeyDown={handleKeyDown}
        aria-label="Breakout game board"
      />
      <div className="arcade-game-footer arcade-score-row">
        <span>SCORE / {String(score).padStart(2, "0")}</span>
        <span>INPUT / MOUSE + ARROWS</span>
        <GameButton onClick={start}>{status === "running" ? "Restart" : "Start breakout"}</GameButton>
      </div>
    </GameShell>
  );
}

function ArcadeLeaderboard({
  game,
  result,
  onSaved,
}: {
  game: ArcadeGame;
  result: ScoreReport | null;
  onSaved: () => void;
}) {
  const [period, setPeriod] = useState<"weekly" | "alltime">("weekly");
  const [name, setName] = useState(() => {
    if (typeof window === "undefined") return "";
    try {
      return window.localStorage.getItem("aim-player-name") ?? "";
    } catch {
      return "";
    }
  });
  const [notice, setNotice] = useState("Reading the current board.");
  const [saving, setSaving] = useState(false);
  const [leaderboards, setLeaderboards] = useState<
    Record<"weekly" | "alltime", ArcadeLeaderboardResponse | null>
  >({ weekly: null, alltime: null });

  const refresh = useCallback(async () => {
    try {
      const responses = await Promise.all([
        fetch(`/api/arcade/leaderboard?game=${game}&period=weekly`, { cache: "no-store" }),
        fetch(`/api/arcade/leaderboard?game=${game}&period=alltime`, { cache: "no-store" }),
      ]);
      const payloads = (await Promise.all(responses.map((response) => response.json()))) as [
        ArcadeLeaderboardResponse,
        ArcadeLeaderboardResponse,
      ];
      setLeaderboards({ weekly: payloads[0], alltime: payloads[1] });
      setNotice(payloads[0].configured ? "Rank = score / handle once per board." : "Local mode. Online board is not configured.");
    } catch {
      setNotice("Local mode. Online board is unavailable right now.");
    }
  }, [game]);

  useEffect(() => {
    const timer = window.setTimeout(() => void refresh(), 0);
    return () => window.clearTimeout(timer);
  }, [refresh]);

  const saveScore = async () => {
    if (!result || saving) return;
    const playerName = name.trim().slice(0, 16);
    if (!playerName || /^anon(?:ymous)?$/i.test(playerName)) {
      setNotice("Choose a real handle before publishing the score.");
      return;
    }
    setSaving(true);
    setNotice("Publishing your score...");
    try {
      const response = await fetch("/api/arcade/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ game, name: playerName, score: result.score, detail: result.label }),
      });
      const payload = (await response.json()) as ArcadeScoreResponse | { accepted: false; error?: string };
      if (!response.ok || !payload.accepted) throw new Error("error" in payload ? payload.error : "Score was not accepted");
      try {
        window.localStorage.setItem("aim-player-name", playerName);
      } catch {
        // Local storage is optional.
      }
      setNotice(`Saved to weekly and all-time boards. Weekly rank #${payload.weeklyRank ?? "--"}.`);
      await refresh();
      onSaved();
    } catch (error) {
      setNotice(error instanceof Error && error.message ? error.message : "The score could not be published.");
    } finally {
      setSaving(false);
    }
  };

  const leaderboard = leaderboards[period];

  return (
    <aside className="arcade-leaderboard" aria-labelledby="arcade-leaderboard-title">
      <div className="arcade-leaderboard-head">
        <div>
          <span className="arcade-game-kicker">Score archive</span>
          <h3 id="arcade-leaderboard-title">High scores.</h3>
        </div>
        <div className="arcade-period-tabs" role="tablist" aria-label="Arcade leaderboard period">
          {(["weekly", "alltime"] as const).map((item) => (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={period === item}
              className={period === item ? "is-active" : ""}
              onClick={() => setPeriod(item)}
            >
              {item === "weekly" ? "This week" : "All time"}
            </button>
          ))}
        </div>
      </div>
      {result ? (
        <div className="arcade-score-submit">
          <div>
            <span>LAST RUN / {result.label}</span>
            <strong>Claim this score?</strong>
          </div>
          <div className="arcade-score-form">
            <label htmlFor={`arcade-player-${game}`}>Handle</label>
            <input
              id={`arcade-player-${game}`}
              value={name}
              maxLength={16}
              onChange={(event) => setName(event.target.value)}
              placeholder="Pronaaf2k"
            />
            <GameButton onClick={saveScore} disabled={saving}>{saving ? "Saving..." : "Save score"}</GameButton>
          </div>
        </div>
      ) : null}
      <div className="arcade-leaderboard-list">
        {leaderboard?.configured && leaderboard.entries.length ? (
          leaderboard.entries.map((entry, index) => (
            <div className="arcade-leaderboard-entry" key={entry.id}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{entry.name}</strong>
              <em>{entry.label}</em>
            </div>
          ))
        ) : (
          <p className="arcade-empty-state">{leaderboard?.configured ? "No scores yet. Own the first run." : "Connect the existing KV / Redis settings to publish scores."}</p>
        )}
      </div>
      <div className="arcade-leaderboard-foot">
        <span>{notice}</span>
        <span>{leaderboard?.label ?? "CHECKING"}</span>
      </div>
    </aside>
  );
}

export function LoadoutArcade() {
  const [selectedGame, setSelectedGame] = useState<ArcadeGame>("reaction");
  const [result, setResult] = useState<{ game: ArcadeGame; report: ScoreReport } | null>(null);
  const selected = arcadeGames.find((game) => game.key === selectedGame) ?? arcadeGames[0];
  const currentResult = result?.game === selectedGame ? result.report : null;
  const reportResult = useCallback(
    (nextResult: ScoreReport) => setResult({ game: selectedGame, report: nextResult }),
    [selectedGame],
  );

  return (
    <section className="arcade-suite" aria-labelledby="arcade-suite-title">
      <div className="arcade-suite-heading">
        <div>
          <p className="eyebrow">Playable / no download</p>
          <h2 id="arcade-suite-title">The browser arcade.</h2>
        </div>
        <p>Small drills and classic games for the space between one build and the next.</p>
      </div>
      <div className="arcade-game-tabs" role="tablist" aria-label="Browser arcade games">
        {arcadeGames.map((game) => (
          <button
            key={game.key}
            type="button"
            role="tab"
            aria-selected={selectedGame === game.key}
            aria-controls={`arcade-panel-${game.key}`}
            className={selectedGame === game.key ? "is-active" : ""}
            onClick={() => {
              setSelectedGame(game.key);
              setResult(null);
            }}
          >
            <strong>{game.label}</strong>
            <span>{game.note}</span>
          </button>
        ))}
      </div>
      <div id={`arcade-panel-${selectedGame}`} role="tabpanel" aria-label={selected.label}>
        {selectedGame === "reaction" && <ReactionGame onComplete={reportResult} />}
        {selectedGame === "recoil" && <RecoilGame onComplete={reportResult} />}
        {selectedGame === "spike" && <SpikeGame onComplete={reportResult} />}
        {selectedGame === "snake" && <SnakeGame onComplete={reportResult} />}
        {selectedGame === "breakout" && <BreakoutGame onComplete={reportResult} />}
      </div>
      <ArcadeLeaderboard game={selectedGame} result={currentResult} onSaved={() => setResult(null)} />
    </section>
  );
}
