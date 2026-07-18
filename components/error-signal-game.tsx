"use client";

import { useCallback, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  RotateCcw,
} from "lucide-react";

const COLUMNS = 7;
const ROWS = 5;
const START = 14;
const EXIT = 20;

const LEVELS = [
  [8, 15, 22, 3, 10, 17, 19, 26],
  [1, 8, 15, 23, 10, 11, 12, 19],
  [7, 8, 9, 17, 24, 5, 12, 19],
];

type Direction = "up" | "right" | "down" | "left";

const movement: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: -1 },
  right: { x: 1, y: 0 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
};

const keyDirections: Record<string, Direction | undefined> = {
  ArrowUp: "up",
  w: "up",
  W: "up",
  ArrowRight: "right",
  d: "right",
  D: "right",
  ArrowDown: "down",
  s: "down",
  S: "down",
  ArrowLeft: "left",
  a: "left",
  A: "left",
};

export function ErrorSignalGame() {
  const [level, setLevel] = useState(0);
  const [position, setPosition] = useState(START);
  const [moves, setMoves] = useState(0);
  const [bumps, setBumps] = useState(0);
  const connected = position === EXIT;
  const blockers = LEVELS[level];

  const move = useCallback(
    (direction: Direction) => {
      if (connected) return;

      const x = position % COLUMNS;
      const y = Math.floor(position / COLUMNS);
      const nextX = x + movement[direction].x;
      const nextY = y + movement[direction].y;
      const next = nextY * COLUMNS + nextX;

      if (
        nextX < 0 ||
        nextX >= COLUMNS ||
        nextY < 0 ||
        nextY >= ROWS ||
        blockers.includes(next)
      ) {
        setBumps((value) => value + 1);
        return;
      }

      setPosition(next);
      setMoves((value) => value + 1);
    },
    [blockers, connected, position],
  );

  function reset() {
    setLevel((value) => (value + 1) % LEVELS.length);
    setPosition(START);
    setMoves(0);
    setBumps(0);
  }

  return (
    <section className="error-game" aria-labelledby="error-game-title">
      <div className="error-game-head">
        <div>
          <p className="eyebrow">Recovery protocol / route {level + 1}</p>
          <h2 id="error-game-title">Reconnect the signal.</h2>
        </div>
        <div className="error-game-stats" aria-live="polite">
          <span>
            Moves <strong>{moves.toString().padStart(2, "0")}</strong>
          </span>
          <span>
            Noise <strong>{bumps.toString().padStart(2, "0")}</strong>
          </span>
        </div>
      </div>

      <p className="error-game-instructions">
        Guide the cyan packet to the gold exit. Use arrow keys, WASD, or the controls.
      </p>

      <div
        className={`error-grid${connected ? " is-connected" : ""}`}
        role="application"
        tabIndex={0}
        aria-label="Signal routing grid. Move the packet to the exit."
        onKeyDown={(event) => {
          const direction = keyDirections[event.key];
          if (!direction) return;
          event.preventDefault();
          move(direction);
        }}
      >
        {Array.from({ length: COLUMNS * ROWS }, (_, index) => {
          const blocked = blockers.includes(index);
          const isPacket = index === position;
          const isExit = index === EXIT;

          return (
            <span
              className={`error-cell${blocked ? " is-blocked" : ""}${
                isExit ? " is-exit" : ""
              }${isPacket ? " is-packet" : ""}`}
              aria-hidden="true"
              key={index}
            />
          );
        })}
        {connected && (
          <div className="error-game-win" role="status">
            <strong>Signal restored</strong>
            <span>{moves} moves / channel open</span>
          </div>
        )}
      </div>

      <div className="error-game-controls">
        <div className="error-dpad" aria-label="Signal controls">
          <button type="button" onClick={() => move("up")} aria-label="Move up">
            <ArrowUp size={17} aria-hidden="true" />
          </button>
          <button type="button" onClick={() => move("left")} aria-label="Move left">
            <ArrowLeft size={17} aria-hidden="true" />
          </button>
          <button type="button" onClick={() => move("down")} aria-label="Move down">
            <ArrowDown size={17} aria-hidden="true" />
          </button>
          <button type="button" onClick={() => move("right")} aria-label="Move right">
            <ArrowRight size={17} aria-hidden="true" />
          </button>
        </div>
        <button className="error-reset" type="button" onClick={reset}>
          <RotateCcw size={15} aria-hidden="true" />
          {connected ? "Play next route" : "New route"}
        </button>
      </div>
    </section>
  );
}
