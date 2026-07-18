"use client";

import Link from "next/link";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { useState, type CSSProperties } from "react";

const WIRES = [
  { id: "cyan", label: "Data", color: "#78dce8" },
  { id: "coral", label: "Power", color: "#ff6b57" },
  { id: "gold", label: "Audio", color: "#f4c95d" },
  { id: "green", label: "Relay", color: "#91d18b" },
] as const;

const RIGHT_ORDER = ["gold", "green", "coral", "cyan"];
const ROW_Y = [14, 38, 62, 86];

type WireId = (typeof WIRES)[number]["id"];

export function ErrorSignalGame() {
  const [selected, setSelected] = useState<WireId | null>(null);
  const [connected, setConnected] = useState<WireId[]>([]);
  const [message, setMessage] = useState("Choose a cable on the left.");
  const complete = connected.length === WIRES.length;

  function chooseSource(id: WireId) {
    if (connected.includes(id)) return;
    setSelected(id);
    const label = WIRES.find((wire) => wire.id === id)?.label.toLowerCase();
    setMessage(`Now connect the ${label} cable.`);
  }

  function chooseSocket(id: WireId) {
    if (!selected || connected.includes(id)) return;

    if (selected !== id) {
      setMessage("That socket does not match. Follow the cable color.");
      return;
    }

    const next = [...connected, id];
    setConnected(next);
    setSelected(null);
    setMessage(
      next.length === WIRES.length
        ? "Repair complete. The route home is unlocked."
        : "Cable connected. Choose the next one.",
    );
  }

  function reset() {
    setSelected(null);
    setConnected([]);
    setMessage("Choose a cable on the left.");
  }

  return (
    <section className="error-game cable-game" aria-labelledby="error-game-title">
      <div className="error-game-head">
        <div>
          <p className="eyebrow">Emergency repair / 04 cables</p>
          <h2 id="error-game-title">Reconnect the panel.</h2>
        </div>
        <div className="cable-progress" aria-live="polite">
          <strong>{connected.length}/4</strong>
          <span>connected</span>
        </div>
      </div>

      <p className="error-game-instructions">
        Tap a cable on the left, then tap the matching socket on the right.
      </p>

      <div className={`cable-board${complete ? " is-complete" : ""}`}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {WIRES.map((wire, index) => {
            const targetIndex = RIGHT_ORDER.indexOf(wire.id);
            const isConnected = connected.includes(wire.id);
            return (
              <g key={wire.id} style={{ color: wire.color }}>
                <path className="cable-stub" d={`M 0 ${ROW_Y[index]} H 18`} />
                <path className="cable-stub" d={`M 82 ${ROW_Y[targetIndex]} H 100`} />
                {isConnected && (
                  <path
                    className="cable-line"
                    d={`M 18 ${ROW_Y[index]} C 40 ${ROW_Y[index]}, 60 ${ROW_Y[targetIndex]}, 82 ${ROW_Y[targetIndex]}`}
                  />
                )}
              </g>
            );
          })}
        </svg>

        {WIRES.map((wire, index) => (
          <button
            className={`cable-terminal is-source${selected === wire.id ? " is-selected" : ""}${
              connected.includes(wire.id) ? " is-connected" : ""
            }`}
            style={{ top: `${ROW_Y[index]}%`, "--cable-color": wire.color } as CSSProperties}
            type="button"
            onClick={() => chooseSource(wire.id)}
            aria-label={`Select ${wire.label} cable`}
            aria-pressed={selected === wire.id}
            key={wire.id}
          >
            <span>{wire.label}</span>
            <i aria-hidden="true" />
          </button>
        ))}

        {RIGHT_ORDER.map((id, index) => {
          const wire = WIRES.find((item) => item.id === id)!;
          return (
            <button
              className={`cable-terminal is-socket${connected.includes(id as WireId) ? " is-connected" : ""}`}
              style={{ top: `${ROW_Y[index]}%`, "--cable-color": wire.color } as CSSProperties}
              type="button"
              onClick={() => chooseSocket(id as WireId)}
              aria-label={`Connect to ${wire.label} socket`}
              key={id}
            >
              <i aria-hidden="true" />
              <span>{wire.label}</span>
            </button>
          );
        })}

        {complete && (
          <div className="cable-complete" role="status">
            <strong>Connection restored</strong>
            <span>Exit route available</span>
          </div>
        )}
      </div>

      <div className="cable-game-foot">
        <p aria-live="polite">{message}</p>
        {complete ? (
          <div className="cable-complete-actions">
            <button className="error-reset" type="button" onClick={reset}>
              <RotateCcw size={15} aria-hidden="true" />
              Repair again
            </button>
            <Link className="button button-primary" href="/">
              <ArrowLeft size={17} aria-hidden="true" />
              Back home
            </Link>
          </div>
        ) : (
          <button
            className="error-reset"
            type="button"
            onClick={reset}
            disabled={connected.length === 0 && !selected}
          >
            <RotateCcw size={15} aria-hidden="true" />
            Reset panel
          </button>
        )}
      </div>
    </section>
  );
}
