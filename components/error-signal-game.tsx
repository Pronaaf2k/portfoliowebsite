"use client";

import Link from "next/link";
import { ArrowLeft, RotateCcw } from "lucide-react";
import {
  useRef,
  useEffect,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";

const WIRES = [
  { id: "cyan", label: "Data", color: "#78dce8" },
  { id: "coral", label: "Power", color: "#ff6b57" },
  { id: "gold", label: "Audio", color: "#f4c95d" },
  { id: "green", label: "Relay", color: "#91d18b" },
] as const;

const DEFAULT_RIGHT_ORDER = ["gold", "green", "coral", "cyan"] as const;
const ROW_Y = [14, 38, 62, 86];

type WireId = (typeof WIRES)[number]["id"];
type DragState = { id: WireId; x: number; y: number };

export function ErrorSignalGame() {
  const boardRef = useRef<HTMLDivElement>(null);
  const dragOrigin = useRef({ x: 0, y: 0 });
  const dragMoved = useRef(false);
  const [rightOrder, setRightOrder] = useState<WireId[]>([
    ...DEFAULT_RIGHT_ORDER,
  ]);
  const [selected, setSelected] = useState<WireId | null>(null);
  const [dragging, setDragging] = useState<DragState | null>(null);
  const [connected, setConnected] = useState<WireId[]>([]);
  const [message, setMessage] = useState("Drag a cable to its matching socket.");
  const complete = connected.length === WIRES.length;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const shuffled = [...DEFAULT_RIGHT_ORDER];
      for (let index = shuffled.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [shuffled[index], shuffled[swapIndex]] = [
          shuffled[swapIndex],
          shuffled[index],
        ];
      }
      setRightOrder(shuffled);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  function wireLabel(id: WireId) {
    return WIRES.find((wire) => wire.id === id)?.label ?? "cable";
  }

  function boardPoint(clientX: number, clientY: number) {
    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100)),
      y: Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100)),
    };
  }

  function connect(id: WireId) {
    const next = [...connected, id];
    setConnected(next);
    setSelected(null);
    setMessage(
      next.length === WIRES.length
        ? "Repair complete. The route home is unlocked."
        : "Cable connected. Drag the next one.",
    );
  }

  function chooseSource(id: WireId) {
    if (connected.includes(id)) return;
    setSelected(id);
    setMessage(`Selected ${wireLabel(id)}. Tap its matching socket or drag it across.`);
  }

  function chooseSocket(id: WireId) {
    if (!selected || connected.includes(id)) return;
    if (selected !== id) {
      setMessage("That socket does not match. Follow the terminal color.");
      return;
    }
    connect(id);
  }

  function beginDrag(id: WireId, event: ReactPointerEvent<HTMLButtonElement>) {
    if (connected.includes(id)) return;
    dragOrigin.current = { x: event.clientX, y: event.clientY };
    dragMoved.current = false;
    setSelected(id);
    setDragging({ id, ...boardPoint(event.clientX, event.clientY) });
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function isInsideMagnetRadius(id: WireId, clientX: number, clientY: number) {
    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) return false;

    const targetRow = rightOrder.indexOf(id);
    const socketX = rect.left + rect.width * 0.82;
    const socketY = rect.top + rect.height * (ROW_Y[targetRow] / 100);
    const magnetRadius = Math.min(56, Math.max(40, rect.width * 0.09));

    return Math.hypot(clientX - socketX, clientY - socketY) <= magnetRadius;
  }

  function moveDrag(id: WireId, event: ReactPointerEvent<HTMLButtonElement>) {
    if (dragging?.id !== id) return;

    if (
      Math.hypot(
        event.clientX - dragOrigin.current.x,
        event.clientY - dragOrigin.current.y,
      ) > 4
    ) {
      dragMoved.current = true;
    }

    if (
      dragMoved.current &&
      isInsideMagnetRadius(id, event.clientX, event.clientY)
    ) {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      setDragging(null);
      connect(id);
      return;
    }

    setDragging({ id, ...boardPoint(event.clientX, event.clientY) });
  }

  function endDrag(id: WireId, event: ReactPointerEvent<HTMLButtonElement>) {
    if (dragging?.id !== id) return;

    if (dragMoved.current) {
      if (isInsideMagnetRadius(id, event.clientX, event.clientY)) {
        connect(id);
      } else {
        setSelected(null);
        setMessage(`Drop the ${wireLabel(id)} cable closer to its matching socket.`);
      }
    }

    setDragging(null);
  }

  function reset() {
    setSelected(null);
    setDragging(null);
    setConnected([]);
    setMessage("Drag a cable to its matching socket.");
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
        Drag each cable to the matching socket. Tap-to-connect also works.
      </p>

      <div
        className={`cable-board${complete ? " is-complete" : ""}`}
        ref={boardRef}
      >
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {WIRES.map((wire, index) => {
            const targetIndex = rightOrder.indexOf(wire.id);
            const isConnected = connected.includes(wire.id);
            const isDragging = dragging?.id === wire.id;

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
                {isDragging && (
                  <path
                    className="cable-line is-dragging"
                    d={`M 18 ${ROW_Y[index]} C 38 ${ROW_Y[index]}, ${Math.max(38, dragging.x - 18)} ${dragging.y}, ${dragging.x} ${dragging.y}`}
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
            }${dragging?.id === wire.id ? " is-dragging" : ""}`}
            style={{ top: `${ROW_Y[index]}%`, "--cable-color": wire.color } as CSSProperties}
            type="button"
            onPointerDown={(event) => beginDrag(wire.id, event)}
            onPointerMove={(event) => moveDrag(wire.id, event)}
            onPointerUp={(event) => endDrag(wire.id, event)}
            onPointerCancel={() => {
              setDragging(null);
              setSelected(null);
            }}
            onClick={() => {
              if (dragMoved.current) {
                dragMoved.current = false;
                return;
              }
              chooseSource(wire.id);
            }}
            aria-label={`Drag or select ${wire.label} cable`}
            aria-pressed={selected === wire.id}
            key={wire.id}
          >
            <span>{wire.label}</span>
            <i aria-hidden="true" />
          </button>
        ))}

        {rightOrder.map((id, index) => {
          const wire = WIRES.find((item) => item.id === id)!;
          return (
            <button
              className={`cable-terminal is-socket${connected.includes(id) ? " is-connected" : ""}${
                dragging?.id === id ? " is-drop-target" : ""
              }`}
              style={{ top: `${ROW_Y[index]}%`, "--cable-color": wire.color } as CSSProperties}
              type="button"
              onClick={() => chooseSocket(id)}
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
            <Link className="button button-primary" href="/">
              <ArrowLeft size={17} aria-hidden="true" />
              Back home
            </Link>
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
